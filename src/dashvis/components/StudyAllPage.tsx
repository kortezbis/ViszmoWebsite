import { useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft,
  Play,
  Layers,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { STUDY_MODES } from '../data/studyModes'
import StudyFlow, { type StudyScopeRow } from './StudyFlow'
import {
  buildStudyScopes,
  fetchRootStudyAllBundle,
  fetchWorkspaceBundle,
  type WsFlashcard,
  type WsLectureNote,
  type WsStudyGuide,
  type WsPodcast,
  type WsDeck,
} from '../lib/workspaceData'

export type StudyAllTarget = {
  workspaceId: string
  title: string
  colorHex: string
}

type StudyAllPageProps = {
  target: StudyAllTarget
  onBack: () => void
}

export default function StudyAllPage({ target, onBack }: StudyAllPageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<WsFlashcard[]>([])
  const [decks, setDecks] = useState<WsDeck[]>([])
  const [notes, setNotes] = useState<WsLectureNote[]>([])
  const [studyGuides, setStudyGuides] = useState<WsStudyGuide[]>([])
  const [podcasts, setPodcasts] = useState<WsPodcast[]>([])
  const [subdeckTitles, setSubdeckTitles] = useState<string[]>([])
  const [isStudyOpen, setIsStudyOpen] = useState(false)
  const [selectedModeId, setSelectedModeId] = useState<string | undefined>(undefined)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rootBundle = await fetchWorkspaceBundle(target.workspaceId)
      const allBundle = await fetchRootStudyAllBundle(target.workspaceId)

      const nextNotes: WsLectureNote[] = [...rootBundle.notes]
      const nextGuides: WsStudyGuide[] = [...rootBundle.studyGuides]
      const nextPodcasts: WsPodcast[] = [...rootBundle.podcasts]
      const titles: string[] = []

      for (const sw of rootBundle.subWorkspaces) {
        titles.push(sw.title)
        const sub = await fetchWorkspaceBundle(sw.id)
        nextNotes.push(...sub.notes)
        nextGuides.push(...sub.studyGuides)
        nextPodcasts.push(...sub.podcasts)
      }

      setCards(allBundle.cards)
      setDecks(allBundle.decks)
      setNotes(nextNotes)
      setStudyGuides(nextGuides)
      setPodcasts(nextPodcasts)
      setSubdeckTitles(titles)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load study content')
    } finally {
      setLoading(false)
    }
  }, [target.workspaceId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const validCards = cards.filter((c) => c.front?.trim() || c.back?.trim())
  const cardCount = validCards.length
  const studyScopes: StudyScopeRow[] = buildStudyScopes(cards, decks)

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-foreground-secondary">
        <Loader2 className="animate-spin text-brand-primary" size={36} />
        <p className="text-sm font-medium">Loading all study content…</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-10 bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-surface-hover rounded-full text-foreground transition-all shrink-0 active:scale-90"
              aria-label="Back"
            >
              <ChevronLeft size={24} />
            </button>
            <div
              className="w-8 h-8 rounded-full shadow-sm shrink-0"
              style={{ backgroundColor: target.colorHex || '#3B82F6' }}
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">
                {target.title}
              </h1>
              <p className="text-xs text-foreground-secondary font-medium">
                Study All · {cardCount} {cardCount === 1 ? 'card' : 'cards'} across all decks
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={cardCount === 0}
            onClick={() => {
              setSelectedModeId(undefined)
              setIsStudyOpen(true)
            }}
            className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-sm hover:bg-black dark:hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-40 active:scale-95 shrink-0"
          >
            <Play size={16} className="fill-white shrink-0" />
            <span className="hidden sm:inline">Study All</span>
            <span className="sm:hidden">Study</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 pb-40 space-y-10">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Flashcards', value: cardCount, color: 'bg-blue-500/10 text-blue-400' },
            { label: 'Sub Decks', value: subdeckTitles.length, color: 'bg-purple-500/10 text-purple-400' },
            { label: 'Lectures', value: notes.length, color: 'bg-red-500/10 text-red-400' },
            { label: 'Study Guides', value: studyGuides.length, color: 'bg-amber-500/10 text-amber-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1"
            >
              <span className={`text-2xl font-black ${stat.color.split(' ')[1]}`}>{stat.value}</span>
              <span className="text-xs text-foreground-secondary font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Study Modes */}
        <div>
          <h2 className="font-bold text-foreground text-lg mb-4 px-1">Choose a Study Mode</h2>
          {cardCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-3xl text-center">
              <Layers size={40} className="text-foreground-muted mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No flashcards yet</h3>
              <p className="text-sm text-foreground-secondary max-w-sm">
                Add flashcards to your decks and sub-decks to start studying.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {STUDY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setSelectedModeId(mode.id)
                    setIsStudyOpen(true)
                  }}
                  className="group relative flex flex-col gap-4 p-5 rounded-2xl border border-border hover:border-brand-primary/40 bg-surface hover:bg-surface-hover transition-all text-left shadow-sm hover:shadow-md"
                >
                  {mode.isPro && (
                    <span className="absolute top-3 right-3 text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full tracking-wider">
                      PRO
                    </span>
                  )}
                  <div
                    className={`w-12 h-12 rounded-xl ${mode.bg} flex items-center justify-center ${mode.text} group-hover:scale-110 transition-transform`}
                  >
                    {mode.icon}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-base">{mode.label}</div>
                    <div className="text-foreground-secondary text-xs mt-1 leading-relaxed line-clamp-2">
                      {mode.description}
                    </div>
                  </div>
                  <div
                    className="mt-auto flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: mode.color }}
                  >
                    <Play size={12} fill="currentColor" />
                    Start
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sub-decks overview */}
        {subdeckTitles.length > 0 && (
          <div>
            <h2 className="font-bold text-foreground text-lg mb-4 px-1">
              Included Sub Decks ({subdeckTitles.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {subdeckTitles.map((title) => (
                <span
                  key={title}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border text-sm font-medium text-foreground-secondary"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lectures */}
        {notes.length > 0 && (
          <div>
            <h2 className="font-bold text-foreground text-lg mb-4 px-1">
              Lectures ({notes.length})
            </h2>
            <div className="flex flex-col gap-3">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center gap-4 bg-sky-900/15 border border-brand-primary/10 rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <Layers size={20} className="text-brand-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{n.title}</p>
                    <p className="text-xs text-foreground-secondary">{n.date} · {n.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Guides */}
        {studyGuides.length > 0 && (
          <div>
            <h2 className="font-bold text-foreground text-lg mb-4 px-1">
              Study Guides ({studyGuides.length})
            </h2>
            <div className="flex flex-col gap-3">
              {studyGuides.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{g.title}</p>
                    {g.topic && (
                      <p className="text-xs text-foreground-secondary truncate">{g.topic}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Cards preview */}
        {validCards.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-bold text-foreground text-lg">
                All Cards ({cardCount})
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {validCards.slice(0, 20).map((card) => (
                <div
                  key={card.id}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm"
                >
                  <div className="grid grid-cols-2 divide-x divide-border gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted block mb-1">
                        Front
                      </span>
                      <p className="text-sm font-bold text-foreground line-clamp-3 whitespace-pre-wrap">
                        {card.front}
                      </p>
                    </div>
                    <div className="pl-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted block mb-1">
                        Back
                      </span>
                      <p className="text-sm text-foreground-secondary line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {card.back}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {validCards.length > 20 && (
                <p className="text-center text-sm text-foreground-secondary py-4">
                  + {validCards.length - 20} more cards
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Study Flow overlay */}
      {isStudyOpen && cardCount > 0 && (
        <StudyFlow
          studyScopes={studyScopes}
          initialModeId={selectedModeId}
          onStartSession={() => {
            setIsStudyOpen(false)
          }}
          onClose={() => {
            setIsStudyOpen(false)
            setSelectedModeId(undefined)
          }}
        />
      )}
    </div>
  )
}
