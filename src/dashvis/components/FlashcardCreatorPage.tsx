import { useState, useRef, useCallback, useEffect } from 'react'
import {
  ArrowLeft, Upload, Link2, PlaySquare, BookOpen, AlignLeft, Mic,
  Plus, Trash2, Sparkles, Check, Loader2, X, FileText,
} from 'lucide-react'
import {
  generateFlashcardsFromText,
  generateFlashcardsFromImages,
  type Flashcard,
} from '../lib/aiGateway'
import { addCardsToDeck, createDeckInWorkspace } from '../lib/workspaceData'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export type CreatorSource =
  | 'upload' | 'record' | 'import' | 'text' | 'subject'
  | 'link' | 'youtube' | 'anki' | 'quizlet' | 'manual'

export type CreatorDest = {
  workspaceId: string
  deckId?: string
  title: string
  color: string
}

type CreatorProps = {
  source: CreatorSource
  dest: CreatorDest
  onDone: () => void
  onBack: () => void
}

const DEFAULT_CARD_COUNT = 20
const MAX_CARDS_PER_REQUEST = 100
const CARD_COUNT_OPTIONS = [10, 20, 40, 60, 100] as const
const DAILY_LIMIT = 40
const COOLDOWN_SECONDS = 10
const MAX_TEXT_INPUT_CHARS = 50000
const MAX_SUBJECT_CHARS = 500
const MAX_LINK_CHARS = 2000
const MAX_TOPIC_CHARS = 2000

const SOURCE_META: Record<CreatorSource, { label: string; color: string; icon: React.ReactNode }> = {
  upload:  { label: 'Upload File', color: 'blue',   icon: <Upload size={20} /> },
  record:  { label: 'Record Audio', color: 'red',    icon: <Mic size={20} /> },
  import:  { label: 'Import',       color: 'green',  icon: <FileText size={20} /> },
  text:    { label: 'Text / Notes', color: 'indigo', icon: <AlignLeft size={20} /> },
  subject: { label: 'Subject',      color: 'orange', icon: <BookOpen size={20} /> },
  link:    { label: 'Link',         color: 'purple', icon: <Link2 size={20} /> },
  youtube: { label: 'YouTube',      color: 'red',    icon: <PlaySquare size={20} /> },
  anki:    { label: 'Anki Import',  color: 'indigo', icon: <FileText size={20} /> },
  quizlet: { label: 'Quizlet',      color: 'blue',   icon: <FileText size={20} /> },
  manual:  { label: 'Manual',       color: 'zinc',   icon: <Plus size={20} /> },
}

export default function FlashcardCreatorPage({ source, dest, onDone, onBack }: CreatorProps) {
  const { user, userId } = useAuth()
  const meta = SOURCE_META[source]

  // shared state
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [generated, setGenerated] = useState(false)
  const [cardCount, setCardCount] = useState<number>(DEFAULT_CARD_COUNT)
  const [isDeleteHolding, setIsDeleteHolding] = useState<number | null>(null)

  // source-specific inputs
  const [textInput, setTextInput] = useState('')
  const [subjectInput, setSubjectInput] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clampCardCount = (requested: number): number =>
    Math.min(Math.max(1, Math.round(requested)), MAX_CARDS_PER_REQUEST)

  const withCountInstruction = (content: string, count: number): string =>
    `Generate exactly ${count} flashcards from the content below. Return no more than ${count} cards. Put each term or concept name on the front (plain label, not a question); put definitions or explanations on the back.\n\nContent:\n${content}`

  const openCustomCountPrompt = () => {
    const raw = window.prompt('How many flashcards would you like to generate? (1-100)', String(cardCount))
    if (!raw) return
    const num = Number.parseInt(raw, 10)
    if (!Number.isFinite(num) || num <= 0) return
    setCardCount(clampCardCount(num))
  }

  const normalizeTermKey = (front: string): string =>
    front.trim().toLowerCase().replace(/\s+/g, ' ')

  const buildDuplicateExclusionBlock = (existing: { front: string }[], maxTerms = 150): string => {
    if (!existing.length) return ''
    const seen = new Set<string>()
    const lines: string[] = []
    for (const c of existing) {
      const k = normalizeTermKey(c.front)
      if (!k || seen.has(k)) continue
      seen.add(k)
      lines.push(`- ${c.front.trim()}`)
      if (lines.length >= maxTerms) break
    }
    if (!lines.length) return ''
    return `\n\nThis deck already has flashcards. Generate ONLY new cards. Do NOT create a card whose front duplicates or closely paraphrases any term below (match by meaning, not just exact wording). Existing terms:\n${lines.join('\n')}`
  }

  const filterDuplicateFlashcards = <T extends { front: string; back: string }>(
    newCards: T[],
    existing: { front: string }[]
  ): T[] => {
    const existingKeys = new Set(existing.map((c) => normalizeTermKey(c.front)))
    const out: T[] = []
    for (const card of newCards) {
      const k = normalizeTermKey(card.front)
      if (!k || existingKeys.has(k)) continue
      existingKeys.add(k)
      out.push(card)
    }
    return out
  }

  const getExistingCardsForDedup = async (deckId: string | undefined): Promise<{ front: string; back: string }[]> => {
    if (!deckId || !supabase) return []
    const { data, error } = await supabase
      .from('cards')
      .select('front, back')
      .eq('deck_id', deckId)
    if (error || !data) return []
    return (data as { front: string | null; back: string | null }[]).map((row) => ({
      front: row.front ?? '',
      back: row.back ?? '',
    }))
  }

  const checkAndConsumeRateLimit = (): { allowed: boolean; reason?: string } => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const dateKey = 'viszmo_ai_daily_date'
    const countKey = 'viszmo_ai_daily_count'
    const lastCallKey = 'viszmo_ai_last_call'

    const lastCallRaw = localStorage.getItem(lastCallKey)
    if (lastCallRaw) {
      const elapsedSec = (Date.now() - Number(lastCallRaw)) / 1000
      if (elapsedSec < COOLDOWN_SECONDS) {
        return { allowed: false, reason: `Please wait ${Math.ceil(COOLDOWN_SECONDS - elapsedSec)} seconds before generating again.` }
      }
    }

    const storedDate = localStorage.getItem(dateKey)
    const storedCount = Number(localStorage.getItem(countKey) ?? '0')
    const currentCount = storedDate === todayKey ? storedCount : 0
    if (currentCount >= DAILY_LIMIT) {
      return { allowed: false, reason: `You've reached the daily limit of ${DAILY_LIMIT} uses for this feature. Resets at midnight.` }
    }

    localStorage.setItem(dateKey, todayKey)
    localStorage.setItem(countKey, String(currentCount + 1))
    localStorage.setItem(lastCallKey, String(Date.now()))
    return { allowed: true }
  }

  // card editor
  const addCard = () => setCards(c => [...c, { front: '', back: '' }])
  const removeCard = (i: number) => setCards(c => c.filter((_, idx) => idx !== i))
  const updateCard = (i: number, field: 'front' | 'back', val: string) =>
    setCards(c => c.map((card, idx) => idx === i ? { ...card, [field]: val } : card))

  // Hold-to-delete logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isDeleteHolding !== null) {
      timer = setTimeout(() => {
        const idx = isDeleteHolding
        setIsDeleteHolding(null)
        removeCard(idx)
      }, 1000)
    }
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [isDeleteHolding])

  // ——— Generation ———
  const generate = async () => {
    setError(null)
    const limit = checkAndConsumeRateLimit()
    if (!limit.allowed) {
      setError(limit.reason || 'Please try again in a moment.')
      return
    }
    setGenerating(true)
    try {
      const safeCount = clampCardCount(cardCount)
      const existing = await getExistingCardsForDedup(dest.deckId)
      const dedup = buildDuplicateExclusionBlock(existing)
      let result: Flashcard[] = []

      if (source === 'text') {
        if (!textInput.trim()) throw new Error('Please paste or type some text first.')
        if (textInput.trim().length > MAX_TEXT_INPUT_CHARS) throw new Error(`Please keep input under ${MAX_TEXT_INPUT_CHARS.toLocaleString()} characters.`)
        const prompt = `Deck Title: "${dest.title}"\n\nGenerate exactly ${safeCount} flashcards from the following content. Return no more than ${safeCount} cards. Put each term or concept name on the front (plain label, not a question); put definitions or explanations on the back.\n\nContent:\n${textInput.trim()}${dedup}`
        result = await generateFlashcardsFromText(prompt)

      } else if (source === 'subject') {
        if (!subjectInput.trim()) throw new Error('Please enter a subject or topic.')
        if (subjectInput.trim().length > MAX_SUBJECT_CHARS) throw new Error(`Please keep your topic under ${MAX_SUBJECT_CHARS} characters.`)
        const prompt = `Generate exactly ${safeCount} flashcards for the topic: "${subjectInput.trim()}". Return no more than ${safeCount} cards. Put each term or concept name on the front (plain label, not a question); put definitions or explanations on the back.${dedup}`
        result = await generateFlashcardsFromText(prompt)

      } else if (source === 'link' || source === 'import') {
        if (!linkInput.trim()) throw new Error('Please enter a URL.')
        if (linkInput.trim().length > MAX_LINK_CHARS) throw new Error(`Please keep links under ${MAX_LINK_CHARS} characters.`)
        const prompt = `A student wants to study from this website: "${linkInput.trim()}"
            
Please analyze the content likely to be found at this URL, then generate exactly ${safeCount} flashcards covering the key concepts. Return no more than ${safeCount} cards. Put each term or concept name on the front (plain label, not a question); put definitions or explanations on the back.${dedup}`
        result = await generateFlashcardsFromText(prompt)

      } else if (source === 'youtube') {
        if (!youtubeInput.trim()) throw new Error('Please paste a YouTube URL or enter a topic.')
        if (youtubeInput.trim().length > MAX_TOPIC_CHARS) throw new Error(`Please keep your link/topic under ${MAX_TOPIC_CHARS} characters.`)
        const prompt = `A student wants to study from this YouTube video: "${youtubeInput.trim()}"
            
Please extract the most likely educational topic from the URL text (look at words in the URL path like video titles), then generate exactly ${safeCount} flashcards covering the key concepts of that topic. Return no more than ${safeCount} cards.

If this appears to be a specific tutorial or lecture, generate cards that would cover what is typically taught in such content.

Put each term or concept name on the front (plain label, not a question); put definitions or explanations on the back.${dedup}`
        result = await generateFlashcardsFromText(prompt)

      } else if (source === 'upload' || source === 'anki' || source === 'quizlet') {
        if (uploadedFiles.length === 0) throw new Error('Please select a file to upload.')
        const file = uploadedFiles[0]

        if (file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file)
          result = await generateFlashcardsFromImages([{ base64, mimeType: file.type }], safeCount)
        } else {
          // For PDFs, text files, etc. — read as text and send to prompt
          const text = await file.text()
          result = await generateFlashcardsFromText(
            `Generate educational flashcards from these study notes. Focus on quality. Put each term or concept name on the front (plain label, not a question); put definitions or explanations on the back.\n\n${text.slice(0, MAX_TEXT_INPUT_CHARS)}${dedup}`
          )
        }

      } else if (source === 'record') {
        if (!recordedBlob) throw new Error('Please record some audio first.')
        const base64 = await blobToBase64(recordedBlob)
        // First transcribe then generate flashcards
        const { transcribeAudio } = await import('../lib/aiGateway')
        const transcript = await transcribeAudio(base64)
        result = await generateFlashcardsFromText(withCountInstruction(transcript, safeCount) + dedup)
      }

      if (result.length === 0) throw new Error('No flashcards were generated. Try providing more content.')
      const deduped = filterDuplicateFlashcards(result, existing)
      setCards(deduped.slice(0, safeCount))
      setGenerated(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // ——— Save cards to Supabase ———
  const saveCards = async () => {
    const validCards = cards.filter(c => c.front.trim() && c.back.trim())
    if (validCards.length === 0) {
      setError('Add at least one complete card before saving.')
      return
    }
    if (!userId || !user?.id) {
      setError('You must be signed in to save cards.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      let deckId = dest.deckId
      if (!deckId) {
        // Create a new deck in the workspace
        deckId = await createDeckInWorkspace(user.id, dest.title, dest.workspaceId)
      }
      await addCardsToDeck(deckId, validCards)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save cards.')
    } finally {
      setSaving(false)
    }
  }

  // ——— Recording ———
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
      setIsRecording(true)
    } catch {
      setError('Could not access microphone. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  // ——— File handling ———
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    setUploadedFiles(Array.from(files))
  }, [])

  const isAiSource = source !== 'manual'
  const canGenerate = !generating && (
    (source === 'text' && textInput.trim().length > 20) ||
    (source === 'subject' && subjectInput.trim().length > 2) ||
    ((source === 'link' || source === 'import') && linkInput.trim().length > 0) ||
    (source === 'youtube' && youtubeInput.trim().length > 0) ||
    ((source === 'upload' || source === 'anki' || source === 'quizlet') && uploadedFiles.length > 0) ||
    (source === 'record' && recordedBlob !== null)
  )

  return (
    <div className="w-full min-h-full bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-full hover:bg-surface-hover text-foreground-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-tight">
                {meta.label}
              </h1>
              <p className="text-xs text-foreground-secondary">Adding to: {dest.title}</p>
            </div>
          </div>

          {cards.length > 0 && (
            <button
              type="button"
              onClick={() => void saveCards()}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-all disabled:opacity-60 shadow-lg shadow-brand-primary/20"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Saving…' : `Save ${cards.filter(c => c.front.trim()).length} Cards`}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in fade-in">
            <X size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* ——— Source Input ——— */}
        {!generated && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* TEXT */}
            {source === 'text' && (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-foreground-muted">
                  Paste your notes or text
                </label>
                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Paste lecture notes, textbook content, or any text you want to turn into flashcards…"
                  rows={12}
                  className="w-full bg-surface border border-border rounded-2xl p-4 text-foreground placeholder:text-foreground-muted resize-none outline-none focus:border-brand-primary transition-colors text-sm leading-relaxed"
                  autoFocus
                />
                <p className="text-xs text-foreground-muted text-right">{textInput.length.toLocaleString()} characters</p>
              </div>
            )}

            {/* SUBJECT */}
            {source === 'subject' && (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-foreground-muted">
                  Enter a subject or topic
                </label>
                <input
                  type="text"
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  placeholder="e.g. Cellular Respiration, French Revolution, Calculus…"
                  className="w-full bg-surface border border-border rounded-2xl px-4 py-4 text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-primary transition-colors text-base"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && canGenerate && void generate()}
                />
                <p className="text-sm text-foreground-secondary">AI will generate comprehensive flashcards covering this topic.</p>
              </div>
            )}

            {/* LINK / IMPORT */}
            {(source === 'link' || source === 'import') && (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-foreground-muted">
                  Article or website URL
                </label>
                <input
                  type="url"
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  placeholder="https://…"
                  className="w-full bg-surface border border-border rounded-2xl px-4 py-4 text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-primary transition-colors text-base"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && canGenerate && void generate()}
                />
              </div>
            )}

            {/* YOUTUBE */}
            {source === 'youtube' && (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-foreground-muted">
                  YouTube URL or Topic
                </label>
                <input
                  type="url"
                  value={youtubeInput}
                  onChange={e => setYoutubeInput(e.target.value)}
                  placeholder="https://youtube.com/... or just a topic"
                  className="w-full bg-surface border border-border rounded-2xl px-4 py-4 text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-primary transition-colors text-base"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && canGenerate && void generate()}
                />
                <p className="text-sm text-foreground-secondary">AI will extract the key concepts from this video and generate flashcards.</p>
              </div>
            )}

            {/* UPLOAD / ANKI / QUIZLET */}
            {(source === 'upload' || source === 'anki' || source === 'quizlet') && (
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-foreground-muted">
                  {source === 'upload' ? 'Upload PDF, image, or text file' :
                   source === 'anki' ? 'Upload Anki .apkg file' : 'Upload Quizlet export (.csv)'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={source === 'anki' ? '.apkg,.txt,.csv' : source === 'quizlet' ? '.csv,.txt' : 'image/*,.pdf,.txt,.md'}
                  multiple={false}
                  onChange={e => handleFiles(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 p-12 border-2 border-dashed border-border rounded-3xl hover:border-brand-primary/50 hover:bg-surface-hover/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center text-foreground-secondary group-hover:text-brand-primary transition-colors">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">Click to upload</p>
                    <p className="text-sm text-foreground-secondary mt-1">
                      {source === 'upload' ? 'PDF, PNG, JPG, TXT, MD' :
                       source === 'anki' ? '.apkg or .txt' : '.csv or .txt'}
                    </p>
                  </div>
                </button>
                {uploadedFiles.length > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
                    <FileText size={20} className="text-brand-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{uploadedFiles[0].name}</p>
                      <p className="text-xs text-foreground-secondary">{(uploadedFiles[0].size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={() => setUploadedFiles([])} className="text-foreground-secondary hover:text-foreground">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* RECORD */}
            {source === 'record' && (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 shadow-2xl shadow-red-500/40 scale-110 animate-pulse'
                    : 'bg-surface-hover border-2 border-border'
                }`}>
                  <Mic size={40} className={isRecording ? 'text-white' : 'text-foreground-secondary'} />
                </div>
                {!isRecording && !recordedBlob && (
                  <button
                    type="button"
                    onClick={() => void startRecording()}
                    className="px-8 py-3 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Start Recording
                  </button>
                )}
                {isRecording && (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-red-500 font-bold animate-pulse">Recording…</p>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-8 py-3 rounded-full bg-foreground text-background font-bold hover:opacity-80 transition-opacity"
                    >
                      Stop Recording
                    </button>
                  </div>
                )}
                {recordedBlob && !isRecording && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
                      <Check size={20} className="text-brand-primary" />
                      <p className="font-bold text-foreground">Recording saved ({(recordedBlob.size / 1024).toFixed(0)} KB)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setRecordedBlob(null); setError(null) }}
                      className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                    >
                      Record again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Generate button for AI sources */}
            {isAiSource && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground-muted">Flashcards to generate</p>
                    <button
                      type="button"
                      onClick={openCustomCountPrompt}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-hover text-sm font-bold text-foreground hover:border-brand-primary/40 transition-colors"
                    >
                      {cardCount}
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {CARD_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setCardCount(count)}
                        className={`h-11 rounded-xl border text-sm font-bold transition-colors ${
                          cardCount === count
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-surface-hover/40 text-foreground-secondary border-border hover:text-foreground hover:border-brand-primary/40'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void generate()}
                  disabled={!canGenerate || generating}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-brand-primary text-white font-bold text-base hover:bg-brand-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-brand-primary/20"
                >
                  {generating
                    ? <><Loader2 size={20} className="animate-spin" /> Generating {cardCount} flashcards…</>
                    : <><Sparkles size={20} /> Generate {cardCount} Flashcards</>
                  }
                </button>
              </div>
            )}

            {/* Manual: start with empty card */}
            {source === 'manual' && cards.length === 0 && (
              <button
                type="button"
                onClick={addCard}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-border hover:border-brand-primary/50 hover:bg-surface-hover/30 transition-all font-bold text-foreground-secondary hover:text-foreground"
              >
                <Plus size={20} />
                Add first card
              </button>
            )}
          </div>
        )}

        {/* ——— Cards Editor ——— */}
        {cards.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground text-lg">
                  {generated ? `${cards.length} Cards Generated` : 'Your Cards'}
                </h2>
                {generated && (
                  <p className="text-sm text-foreground-secondary">Review and edit before saving.</p>
                )}
              </div>
              <button
                type="button"
                onClick={addCard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover font-bold text-sm transition-colors"
              >
                <Plus size={16} />
                Add card
              </button>
            </div>

            <div className="space-y-3">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-primary/40 transition-colors group"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-hover/30">
                    <span className="text-xs font-black uppercase tracking-widest text-foreground-muted">Card {i + 1}</span>
                    <button
                      type="button"
                      className={`relative p-1.5 rounded-lg text-foreground-muted hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 overflow-hidden ${isDeleteHolding === i ? 'hold-to-delete-active bg-red-500/10' : 'hover:bg-red-500/10'}`}
                      onMouseDown={() => setIsDeleteHolding(i)}
                      onMouseUp={() => setIsDeleteHolding(null)}
                      onMouseLeave={() => setIsDeleteHolding(null)}
                      onTouchStart={() => setIsDeleteHolding(i)}
                      onTouchEnd={() => setIsDeleteHolding(null)}
                    >
                      <div className="hold-to-delete-progress" />
                      <Trash2 size={14} className="relative z-10" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted mb-2">Front</p>
                      <textarea
                        value={card.front}
                        onChange={e => updateCard(i, 'front', e.target.value)}
                        placeholder="Question or term…"
                        rows={3}
                        className="w-full bg-transparent text-foreground text-sm resize-none outline-none placeholder:text-foreground-muted"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted mb-2">Back</p>
                      <textarea
                        value={card.back}
                        onChange={e => updateCard(i, 'back', e.target.value)}
                        placeholder="Answer or definition…"
                        rows={3}
                        className="w-full bg-transparent text-foreground text-sm resize-none outline-none placeholder:text-foreground-muted"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom save bar */}
            <div className="sticky bottom-6 pt-4">
              <button
                type="button"
                onClick={() => void saveCards()}
                disabled={saving || cards.filter(c => c.front.trim() && c.back.trim()).length === 0}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-brand-primary text-white font-bold text-base hover:bg-brand-primary/90 transition-all disabled:opacity-40 shadow-2xl shadow-brand-primary/20"
              >
                {saving
                  ? <><Loader2 size={20} className="animate-spin" /> Saving…</>
                  : <><Check size={20} /> Save {cards.filter(c => c.front.trim() && c.back.trim()).length} Cards to "{dest.title}"</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ——— Helpers ———
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // strip data: prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
