import { useCallback, useEffect, useState } from 'react'
import {
  Play,
  Edit2,
  Trash2,
  ChevronLeft,
  MoreVertical,
  Plus,
  Mic,
  Layers,
  BookMarked,
  Podcast,
  Sparkles,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import StudyFlow, { type StudyScopeRow } from './StudyFlow'
import { STUDY_MODES } from '../data/studyModes'
import type { LibraryOpenLecture } from './LibraryPage'
import {
  buildStudyScopes,
  fetchRootStudyAllBundle,
  fetchWorkspaceBundle,
  deleteFlashcard,
  type WsDeck,
  type WsFlashcard,
  type WsLectureNote,
  type WsStudyGuide,
  type WsPodcast,
} from '../lib/workspaceData'

export type DeckDetailsTarget = {
  workspaceId: string
  /** When true, aggregate root + all Sub Decks (iOS: “Study all decks”). */
  studyAll: boolean
  title: string
  colorHex: string
}

type CreateMaterialType = 'flashcards' | 'lectures' | 'guides' | 'podcasts'

type DeckDetailsPageProps = {
  target: DeckDetailsTarget
  onBack: () => void
  onOpenCardEditor?: (payload: {
    title: string
    cards: WsFlashcard[]
    orderStorageKey: string
    initialCardId?: string
  }) => void
  /** Open a lecture note (same shell as Library). */
  onOpenLecture?: (l: LibraryOpenLecture) => void
  /** Opens the global Create modal for this workspace (Add → Lecture, etc.). */
  onOpenCreateMaterial?: (type: CreateMaterialType, info: { cardCount: number; title: string; color: string }) => void
  onOpenPodcast?: (payload: { title: string; content: string; workspaceId?: string; initialScript?: any }) => void
}

type TabId = 'Cards' | 'Lectures' | 'Study Guides' | 'Podcasts'

export default function DeckDetailsPage({
  target,
  onBack,
  onOpenCardEditor,
  onOpenLecture,
  onOpenCreateMaterial,
  onOpenPodcast,
}: DeckDetailsPageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<WsFlashcard[]>([])
  const [decks, setDecks] = useState<WsDeck[]>([])
  const [notes, setNotes] = useState<WsLectureNote[]>([])
  const [studyGuides, setStudyGuides] = useState<WsStudyGuide[]>([])
  const [podcasts, setPodcasts] = useState<WsPodcast[]>([])
  const [isStudyOpen, setIsStudyOpen] = useState(false)
  const [isStudyDropdownOpen, setIsStudyDropdownOpen] = useState(false)
  const [selectedStudyModeId, setSelectedStudyModeId] = useState<string | undefined>(undefined)

  const [activeTab, setActiveTab] = useState<TabId>('Cards')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [generateMenuOpen, setGenerateMenuOpen] = useState(false)
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null)

  const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null)

  const orderStorageKey = `deck-card-order:${target.workspaceId}:${target.studyAll ? 'all' : 'current'}`

  const applyStoredOrder = useCallback(
    (inputCards: WsFlashcard[]) => {
      const next = [...inputCards]
      const raw = localStorage.getItem(orderStorageKey)
      if (!raw) return next
      try {
        const ids = JSON.parse(raw) as string[]
        const rank = new Map(ids.map((id, index) => [id, index]))
        return next.sort((a, b) => {
          const ar = rank.get(a.id)
          const br = rank.get(b.id)
          if (ar === undefined && br === undefined) return a.createdAt - b.createdAt
          if (ar === undefined) return 1
          if (br === undefined) return -1
          return ar - br
        })
      } catch {
        return next
      }
    },
    [orderStorageKey]
  )

  const load = useCallback(
    async (opts?: { isRefresh?: boolean }) => {
      if (!opts?.isRefresh) {
        setLoading(true)
      }
      setError(null)
      try {
        let nextCards: WsFlashcard[] = []
        if (target.studyAll) {
          const b = await fetchRootStudyAllBundle(target.workspaceId)
          nextCards = applyStoredOrder(b.cards)
          setDecks(b.decks)
        } else {
          const b = await fetchWorkspaceBundle(target.workspaceId)
          nextCards = applyStoredOrder(b.cards)
          setDecks(b.decks)
        }

        const rootBundle = await fetchWorkspaceBundle(target.workspaceId)
        let nextNotes: WsLectureNote[] = []
        let nextGuides: WsStudyGuide[] = []
        if (target.studyAll) {
          nextNotes = [...rootBundle.notes]
          nextGuides = [...rootBundle.studyGuides]
          for (const sw of rootBundle.subWorkspaces) {
            const sub = await fetchWorkspaceBundle(sw.id)
            nextNotes.push(...sub.notes)
            nextGuides.push(...sub.studyGuides)
          }
        } else {
          nextNotes = rootBundle.notes
          nextGuides = rootBundle.studyGuides
        }

        setCards(nextCards)
        setNotes(nextNotes)
        setStudyGuides(nextGuides)
        setPodcasts(rootBundle.podcasts)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load deck')
      } finally {
        if (!opts?.isRefresh) {
          setLoading(false)
        }
      }
    },
    [target.studyAll, target.workspaceId, applyStoredOrder]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load when target changes
    void load()
  }, [load])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isDeleteHolding) {
      timer = setTimeout(() => {
        const id = isDeleteHolding
        setIsDeleteHolding(null)
        if (id.startsWith('card-')) {
          const cardId = id.replace('card-', '')
          void deleteFlashcard(cardId)
            .then(() => load({ isRefresh: true }))
            .catch((err) => {
              window.alert(err instanceof Error ? err.message : 'Could not delete flashcard')
            })
        }
      }, 1000)
    }
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-run when hold id changes
  }, [isDeleteHolding])

  const openCardEditor = (initialCardId?: string) => {
    onOpenCardEditor?.({
      title: target.title,
      cards: validCards,
      orderStorageKey,
      initialCardId,
    })
  }

  const validCards = cards.filter((c) => c.front?.trim() || c.back?.trim())
  const cardCount = validCards.length

  const studyScopes: StudyScopeRow[] = buildStudyScopes(cards, decks)

  const createInfo = { cardCount, title: target.title, color: target.colorHex }

  return (
    <div
      className="w-full h-full overflow-y-auto bg-background"
      onClick={() => {
        setIsMenuOpen(false)
        setGenerateMenuOpen(false)
        setActiveCardMenuId(null)
        setIsStudyDropdownOpen(false)
      }}
    >
      <div className="sticky top-14 md:top-0 z-10 bg-surface">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
          <div className="flex items-center justify-between gap-4">
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
                style={{ backgroundColor: target.colorHex || '#0EA5E9' }}
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">{target.title}</h1>
                <p className="text-xs text-foreground-secondary font-medium">
                  {target.studyAll ? 'All decks in workspace' : 'Deck'} · {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(!isMenuOpen)
                  }}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isMenuOpen
                      ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                  aria-label="Deck menu"
                >
                  <MoreVertical size={20} className={isMenuOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 z-50 popover-menu-surface p-1.5 shadow-2xl rounded-xl border border-border bg-surface animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-surface-hover rounded-lg text-left transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMenuOpen(false)
                        openCardEditor()
                      }}
                    >
                      <Edit2 size={16} className="text-foreground-secondary" />
                      Edit cards
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setGenerateMenuOpen(!generateMenuOpen)
                    }}
                    className="px-5 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-hover text-foreground font-bold text-sm transition-all flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                  {generateMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 z-50 popover-menu-surface p-1.5 shadow-2xl rounded-xl border border-border bg-surface animate-in fade-in zoom-in-95 duration-100">
                      <p className="px-2 pt-1 pb-2 text-[10px] font-black uppercase tracking-widest text-foreground-secondary">
                        Add to this deck
                      </p>
                      <button
                        type="button"
                        className="w-full flex items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-hover transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setGenerateMenuOpen(false)
                          openCardEditor()
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                          <Layers size={18} />
                        </div>
                        <div>
                          <span className="block font-bold text-foreground text-sm">Flashcards</span>
                          <span className="block text-xs text-foreground-secondary mt-0.5 leading-snug">
                            Add cards to this deck
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-hover transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setGenerateMenuOpen(false)
                          onOpenCreateMaterial?.('lectures', createInfo)
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                          <Mic size={18} />
                        </div>
                        <div>
                          <span className="block font-bold text-foreground text-sm">Lecture</span>
                          <span className="block text-xs text-foreground-secondary mt-0.5 leading-snug">
                            Record and transcribe
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    disabled={cardCount === 0}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (cardCount === 0) return
                      setIsStudyDropdownOpen(!isStudyDropdownOpen)
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-sm hover:bg-black dark:hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-40 active:scale-95"
                  >
                    <Play size={16} className="fill-white shrink-0" />
                    <span className="hidden sm:inline">Study Deck</span>
                    <span className="sm:hidden">Study</span>
                    <ChevronDown size={16} className={`shrink-0 transition-transform ${isStudyDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStudyDropdownOpen && cardCount > 0 && (
                    <>
                      <div className="fixed inset-0 z-[100]" onClick={() => setIsStudyDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-80 popover-menu-surface p-2 shadow-2xl z-[110] flex flex-col gap-1 popover-menu-dropdown-animate">
                        <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                          Choose Study Mode
                        </p>
                        {STUDY_MODES.map((mode) => (
                          <button
                            type="button"
                            key={mode.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsStudyDropdownOpen(false)
                              setSelectedStudyModeId(mode.id)
                              setIsStudyOpen(true)
                            }}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-all text-left w-full group"
                          >
                            <div
                              className={`w-10 h-10 rounded-xl ${mode.bg} flex items-center justify-center ${mode.text} shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                            >
                              {mode.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-foreground text-[15px] flex items-center gap-2">
                                {mode.label}
                                {mode.isPro && (
                                  <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded-md tracking-wider">
                                    PRO
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-foreground-secondary truncate mt-0.5">{mode.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 flex gap-8">
            {(['Cards', 'Lectures', 'Study Guides', 'Podcasts'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold transition-all relative ${
                  activeTab === tab ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6 pb-40">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-8 w-full">{error}</p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-foreground-secondary">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
            <p className="text-sm font-medium">Loading deck…</p>
          </div>
        ) : (
          <>
            {activeTab === 'Cards' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2 px-2">
                  <h2 className="font-bold text-foreground">Cards ({validCards.length})</h2>
                  {validCards.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openCardEditor()}
                      className="text-xs font-bold text-brand-primary hover:underline"
                    >
                      Edit all
                    </button>
                  )}
                </div>

                {validCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-3xl bg-surface/50">
                    <h3 className="text-lg font-bold text-foreground mb-2">This deck is empty</h3>
                    <p className="text-foreground-secondary text-sm text-center max-w-sm mb-6">
                      Add your first flashcards to start studying.
                    </p>
                    <button
                      type="button"
                      onClick={() => openCardEditor()}
                      className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20"
                    >
                      <Plus size={18} />
                      Add Cards
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {validCards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="mb-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted block mb-1">
                                Front
                              </span>
                              <p className="text-sm font-bold text-foreground line-clamp-3 whitespace-pre-wrap">{card.front}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted block mb-1">
                                Back
                              </span>
                              <p className="text-sm text-foreground-secondary line-clamp-3 leading-relaxed whitespace-pre-wrap">
                                {card.back}
                              </p>
                            </div>
                          </div>
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveCardMenuId(activeCardMenuId === card.id ? null : card.id)
                              }}
                              className="p-1.5 rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-active transition-all"
                              aria-label="Card actions"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {activeCardMenuId === card.id && (
                              <div className="absolute right-0 top-10 w-44 z-20 p-1.5 popover-menu-surface shadow-2xl rounded-xl border border-border animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-surface-hover rounded-lg text-left transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveCardMenuId(null)
                                    openCardEditor(card.id)
                                  }}
                                >
                                  <Edit2 size={16} className="text-foreground-secondary" />
                                  Edit
                                </button>
                                <div className="h-px bg-border my-1 mx-1" />
                                <button
                                  type="button"
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-left transition-colors hold-to-delete-container ${
                                    isDeleteHolding === `card-${card.id}` ? 'hold-to-delete-active' : ''
                                  }`}
                                  onMouseDown={() => setIsDeleteHolding(`card-${card.id}`)}
                                  onMouseUp={() => setIsDeleteHolding(null)}
                                  onMouseLeave={() => setIsDeleteHolding(null)}
                                  onTouchStart={() => setIsDeleteHolding(`card-${card.id}`)}
                                  onTouchEnd={() => setIsDeleteHolding(null)}
                                >
                                  <div className="hold-to-delete-progress" />
                                  <span className="relative z-10 flex items-center gap-2">
                                    <Trash2 size={16} />
                                    Hold to delete
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Lectures' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2 px-2">
                  <h2 className="font-bold text-foreground">Lectures ({notes.length})</h2>
                </div>

                {notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-3xl bg-surface/50">
                    <h3 className="text-lg font-bold text-foreground mb-2">No lectures for this deck</h3>
                    <p className="text-foreground-secondary text-sm text-center max-w-sm mb-6">
                      Recordings and transcripts linked to this workspace will appear here.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenCreateMaterial?.('lectures', createInfo)}
                      className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20"
                    >
                      <Mic size={18} />
                      Add lecture
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {notes.map((lecture) => (
                      <button
                        key={lecture.id}
                        type="button"
                        onClick={() =>
                          onOpenLecture?.({
                            id: lecture.id,
                            title: lecture.title,
                            date: lecture.date,
                            duration: lecture.duration,
                          })
                        }
                        className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/50 transition-all shadow-sm w-full text-left"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <Mic size={20} className="text-brand-primary" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                              {lecture.title}
                            </h3>
                            <div className="text-sm text-foreground-secondary font-medium">{lecture.date}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Study Guides' &&
              (studyGuides.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h2 className="font-bold text-foreground">Study Guides ({studyGuides.length})</h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {studyGuides.map((g) => (
                      <div key={g.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
                        <h3 className="font-bold text-foreground">{g.title}</h3>
                        {g.topic ? <p className="text-sm text-foreground-secondary mt-2">{g.topic}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-surface/50 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-surface-active rounded-2xl flex items-center justify-center mb-4">
                    <BookMarked size={32} className="text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">No Study Guides yet</h3>
                  <p className="text-foreground-secondary text-sm max-w-sm mb-6 font-medium">
                    Generate a comprehensive study guide for this deck.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenCreateMaterial?.('guides', createInfo)}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20"
                  >
                    <Sparkles size={18} />
                    Generate Guide
                  </button>
                </div>
              ))}

            {activeTab === 'Podcasts' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2 px-2">
                  <h2 className="font-bold text-foreground">Podcasts ({podcasts.length})</h2>
                </div>

                {podcasts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-surface/50 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-surface-active rounded-2xl flex items-center justify-center mb-4">
                      <Podcast size={32} className="text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">No Podcasts yet</h3>
                    <p className="text-foreground-secondary text-sm max-w-sm mb-6 font-medium">
                      Create an AI-narrated podcast summary.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenCreateMaterial?.('podcasts', createInfo)}
                      className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20"
                    >
                      <Sparkles size={18} />
                      Generate Podcast
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {podcasts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          onOpenPodcast?.({
                            title: p.title,
                            content: '',
                            workspaceId: target.workspaceId,
                            initialScript: p.script,
                          })
                        }
                        className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/50 transition-all shadow-sm w-full text-left"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                            <Podcast size={20} className="text-purple-500" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                              {p.title}
                            </h3>
                            <div className="text-sm text-foreground-secondary font-medium italic">Viszmo Podcast Episode</div>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isStudyOpen && cardCount > 0 && (
        <StudyFlow
          studyScopes={studyScopes}
          initialModeId={selectedStudyModeId}
          onStartSession={() => {
            setIsStudyOpen(false)
          }}
          onClose={() => {
            setIsStudyOpen(false)
            setSelectedStudyModeId(undefined)
            void load()
          }}
        />
      )}
    </div>
  )
}
