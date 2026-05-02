import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  MoreVertical,
  Calendar,
  Edit2,
  AlignLeft,
  ListOrdered,
  Trash2,
  Loader2,
  BookOpen,
} from 'lucide-react'
import type { LibraryOpenLecture } from './LibraryPage'
import { supabase } from '../lib/supabase'
import { addTrashItem } from '../lib/browserTrash'

type TabId = 'summary' | 'transcript'

type GlossaryEntry = { term: string; definition: string }

function parseGlossary(raw: unknown): GlossaryEntry[] {
  if (!Array.isArray(raw)) return []
  const out: GlossaryEntry[] = []
  for (const x of raw) {
    if (x && typeof x === 'object' && 'term' in x && 'definition' in x) {
      const o = x as { term: unknown; definition: unknown }
      if (typeof o.term === 'string' && typeof o.definition === 'string') {
        out.push({ term: o.term, definition: o.definition })
      }
    }
  }
  return out
}

export default function LecturePage({
  onBack,
  lecture,
}: {
  onBack?: () => void
  lecture: LibraryOpenLecture
}) {
  const isBrowserPlaceholder = lecture.id === 'browser-recording'
  const missingSupabase = !isBrowserPlaceholder && !supabase
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [tab, setTab] = useState<TabId>('summary')
  const [loading, setLoading] = useState(() => !isBrowserPlaceholder && Boolean(supabase))
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState(lecture.title)
  const [duration, setDuration] = useState(lecture.duration)
  const [dateLabel, setDateLabel] = useState(lecture.date)
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState<string | null>(null)
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([])
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([])
  const [isDeleteHolding, setIsDeleteHolding] = useState<boolean>(false)

  useEffect(() => {
    if (isBrowserPlaceholder || !supabase) return

    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: qErr } = await supabase
          .from('transcripts')
          .select('id,title,content,summary,key_takeaways,glossary,duration,created_at')
          .eq('id', lecture.id)
          .maybeSingle()
        if (cancelled) return
        if (qErr) {
          setError(qErr.message)
          setLoading(false)
          return
        }
        if (!data) {
          setError('Lecture not found.')
          setLoading(false)
          return
        }
        setTitle(data.title || 'Untitled lecture')
        setContent(typeof data.content === 'string' ? data.content : '')
        setSummary(typeof data.summary === 'string' ? data.summary : data.summary != null ? String(data.summary) : null)
        const kt = data.key_takeaways
        setKeyTakeaways(
          Array.isArray(kt) ? kt.filter((x): x is string => typeof x === 'string') : []
        )
        setGlossary(parseGlossary(data.glossary))
        setDuration(typeof data.duration === 'string' && data.duration ? data.duration : lecture.duration)
        if (data.created_at) {
          setDateLabel(
            new Date(data.created_at as string).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          )
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load lecture.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isBrowserPlaceholder, lecture.id, lecture.duration])

  useEffect(() => {
    if (!isMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      const node = menuRef.current
      if (node?.contains(e.target as Node)) return
      setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [isMenuOpen])

  const handleRename = async () => {
    if (isBrowserPlaceholder) {
      window.alert('Save this lecture to your library before renaming.')
      return
    }
    if (!supabase) {
      window.alert('Supabase is not configured.')
      return
    }
    const next = window.prompt('Lecture title', title)?.trim()
    if (!next || next === title) return
    const { error: uErr } = await supabase.from('transcripts').update({ title: next }).eq('id', lecture.id)
    if (uErr) {
      window.alert(uErr.message)
      return
    }
    setTitle(next)
    setIsMenuOpen(false)
  }

  const handleDelete = async () => {
    if (!isBrowserPlaceholder) {
      if (!supabase) {
        window.alert('Supabase is not configured.')
        return
      }
      const { error: dErr } = await supabase.from('transcripts').delete().eq('id', lecture.id)
      if (dErr) {
        window.alert(dErr.message)
        return
      }
      addTrashItem({
        kind: 'lecture',
        id: lecture.id,
        title,
        subtitle: dateLabel,
      })
    }
    setIsMenuOpen(false)
    onBack?.()
  }

  // Hold-to-delete logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isDeleteHolding) {
      timer = setTimeout(() => {
        setIsDeleteHolding(false)
        void handleDelete()
      }, 1000)
    }
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-run when hold id changes
  }, [isDeleteHolding])

  const summaryEmpty =
    !summary?.trim() && keyTakeaways.length === 0 && glossary.length === 0

  return (
    <div className="w-full h-full overflow-y-auto relative bg-background text-foreground min-w-0">
      <div className="sticky top-14 md:top-0 z-10 bg-surface border-b border-border shadow-sm w-full">
        <div className="max-w-3xl mx-auto pt-4 sm:pt-6 pb-3 px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors font-medium shrink-0"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div ref={menuRef} className="flex items-center gap-1 text-foreground-secondary relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
              className={`p-2 rounded-full transition-all duration-300 ${
                isMenuOpen
                  ? 'popover-menu-trigger-on text-foreground'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
              }`}
              aria-label="Lecture options"
            >
              <MoreVertical size={20} className={isMenuOpen ? 'popover-menu-trigger-rotate' : ''} />
            </button>

            {isMenuOpen && (
              <div className="absolute top-11 right-0 w-56 z-50 p-1.5 popover-menu-surface popover-menu-dropdown-animate flex flex-col">
                <button
                  type="button"
                  className="popover-menu-item"
                  onClick={() => {
                    void handleRename()
                  }}
                >
                  <Edit2 size={16} className="shrink-0" />
                  <span>Edit title</span>
                </button>
                <button
                  type="button"
                  className="popover-menu-item"
                  onClick={() => {
                    setTab('summary')
                    setIsMenuOpen(false)
                  }}
                >
                  <BookOpen size={16} className="shrink-0" />
                  <span>View summary</span>
                </button>
                <button
                  type="button"
                  className="popover-menu-item"
                  onClick={() => {
                    setTab('transcript')
                    setIsMenuOpen(false)
                  }}
                >
                  <AlignLeft size={16} className="shrink-0" />
                  <span>View transcript</span>
                </button>
                <div className="popover-menu-divider" />
                <button
                  type="button"
                  className={`hold-to-delete-container ${isDeleteHolding ? 'hold-to-delete-active' : ''}`}
                  onMouseDown={() => setIsDeleteHolding(true)}
                  onMouseUp={() => setIsDeleteHolding(false)}
                  onMouseLeave={() => setIsDeleteHolding(false)}
                  onTouchStart={() => setIsDeleteHolding(true)}
                  onTouchEnd={() => setIsDeleteHolding(false)}
                >
                  <div className="hold-to-delete-progress" />
                  <div className="relative z-10 flex items-center gap-2.5 w-full">
                    <Trash2 size={16} className="shrink-0" />
                    <span className="font-semibold">
                      {isDeleteHolding ? 'Hold to confirm' : 'Delete'}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 pb-24 min-w-0">
        {missingSupabase && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Sign in and configure Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) to load lectures.
          </div>
        )}

        {!missingSupabase && loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-foreground-secondary">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm">Loading lecture…</p>
          </div>
        )}

        {!missingSupabase && !loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        {!missingSupabase && !loading && !error && (
          <>
            <h1 className="text-2xl sm:text-4xl font-bold font-heading mb-4 sm:mb-6 leading-tight break-words">{title}</h1>

            <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-surface border border-border text-xs sm:text-sm font-medium text-foreground-secondary">
                <Calendar size={16} className="shrink-0" />
                <span>{dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-surface border border-border text-xs sm:text-sm font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0" />
                <span className="text-foreground-secondary">{duration}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-surface border border-border w-fit mb-6 sm:mb-8">
              <button
                type="button"
                onClick={() => setTab('summary')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  tab === 'summary'
                    ? 'bg-brand-primary/15 text-brand-primary'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                Summary
              </button>
              <button
                type="button"
                onClick={() => setTab('transcript')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  tab === 'transcript'
                    ? 'bg-brand-primary/15 text-brand-primary'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                Transcript
              </button>
            </div>

            {isBrowserPlaceholder && (
              <div className="rounded-2xl border border-dashed border-border bg-surface-hover/20 px-4 sm:px-6 py-12 sm:py-16 text-center">
                <p className="text-foreground-secondary text-sm leading-relaxed max-w-md mx-auto">
                  This is a local browser recording placeholder. When you record or import lectures that sync to your account,
                  they will open here with summary and transcript from your library.
                </p>
              </div>
            )}

            {!isBrowserPlaceholder && tab === 'summary' && (
              <div className="space-y-8 min-w-0">
                {summary?.trim() ? (
                  <section>
                    <h2 className="text-lg font-bold text-foreground mb-3">Overview</h2>
                    <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed whitespace-pre-wrap break-words">
                      {summary.trim()}
                    </p>
                  </section>
                ) : null}

                {keyTakeaways.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <ListOrdered size={18} className="text-brand-primary shrink-0" />
                      Key takeaways
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-foreground-secondary">
                      {keyTakeaways.map((line, i) => (
                        <li key={i} className="break-words">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {glossary.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-foreground mb-3">Glossary</h2>
                    <dl className="space-y-4">
                      {glossary.map((entry, i) => (
                        <div key={i} className="rounded-xl border border-border bg-surface px-4 py-3">
                          <dt className="font-semibold text-foreground text-sm sm:text-base">{entry.term}</dt>
                          <dd className="mt-1 text-sm text-foreground-secondary leading-relaxed">{entry.definition}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                {summaryEmpty && (
                  <div className="rounded-2xl border border-border bg-surface px-4 py-10 text-center">
                    <p className="text-foreground-secondary text-sm max-w-md mx-auto">
                      No summary yet. Switch to <span className="text-foreground font-medium">Transcript</span> to read the full
                      note, or generate insights from the mobile app.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isBrowserPlaceholder && tab === 'transcript' && (
              <div className="rounded-2xl border border-border bg-surface px-4 sm:px-6 py-6 min-h-[12rem]">
                {content.trim() ? (
                  <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed whitespace-pre-wrap break-words">
                    {content}
                  </p>
                ) : (
                  <p className="text-foreground-secondary text-sm text-center py-8">No transcript text stored for this lecture.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
