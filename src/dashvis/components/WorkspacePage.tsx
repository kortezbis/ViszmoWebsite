import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  Play,
  MoreVertical,
  ChevronLeft,
  ChevronUp,
  Plus,
  Edit2,
  Share2,
  Trash2,
  Mic,
  BookMarked,
  Loader2,
  X,
  Layers,
  FileText,
  Podcast,
  Waves,
  Keyboard,
} from 'lucide-react'
import type { PageId } from '../navigation'
import type { LibraryOpenLecture, LibraryOpenWorkspace } from './LibraryPage'
import type { DeckDetailsTarget } from './DeckDetailsPage'
import type { StudyAllTarget } from './StudyAllPage'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import {
  type WsFlashcard,
  type WsLectureNote,
  type WsStudyGuide,
  type WsSubWorkspace,
  type WsPodcast,
  fetchWorkspaceBundle,
  getPreferredFlashcardDeckId,
  createWorkspace,
  deleteWorkspaceCascading,
  createDeckInWorkspace,
  addCardsToDeck,
  deleteFlashcard,
} from '../lib/workspaceData'
import { addTrashItem } from '../lib/browserTrash'

type WorkspacePageProps = {
  workspace: LibraryOpenWorkspace
  stackDepth: number
  onPageChange: (page: PageId) => void
  onOpenSubWorkspace: (w: LibraryOpenWorkspace) => void
  onBackInStack: () => void
  onOpenLecture: (l: LibraryOpenLecture) => void
  onOpenDeckDetails: (t: DeckDetailsTarget) => void
  onOpenStudyAll: (t: StudyAllTarget) => void
  onOpenCreateMaterial: (
    type: CreateMaterialType,
    info: { cardCount: number; title: string; color: string }
  ) => void
  onOpenCardEditor: (payload: {
    title: string
    cards: WsFlashcard[]
    orderStorageKey: string
    initialCardId?: string
  }) => void
  onOpenPodcast: (payload: { title: string; content: string; workspaceId?: string; initialScript?: any }) => void
}

const tabs = ['Cards', 'Lectures', 'Study Guides', 'Podcasts'] as const
type TabId = (typeof tabs)[number]

type CreateMaterialType = 'flashcards' | 'lectures' | 'guides' | 'podcasts'

const CREATE_MATERIAL_OPTIONS: {
  type: CreateMaterialType
  tab: TabId
  label: string
  description: string
  icon: ReactNode
}[] = [
  {
    type: 'flashcards',
    tab: 'Cards',
    label: 'Flashcards',
    description: 'Upload, paste, or import into this deck',
    icon: (
      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
        <Layers size={18} />
      </div>
    ),
  },
  {
    type: 'lectures',
    tab: 'Lectures',
    label: 'Lecture',
    description: 'Record and transcribe for this deck',
    icon: (
      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
        <Mic size={18} />
      </div>
    ),
  },
  {
    type: 'guides',
    tab: 'Study Guides',
    label: 'Study guide',
    description: 'Build a guide from your sources',
    icon: (
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
        <FileText size={18} />
      </div>
    ),
  },
  {
    type: 'podcasts',
    tab: 'Podcasts',
    label: 'Podcast',
    description: 'Turn materials into an episode',
    icon: (
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
        <Podcast size={18} />
      </div>
    ),
  },
]

const FLASHCARD_ADD_OPTION = CREATE_MATERIAL_OPTIONS.find((o) => o.type === 'flashcards')!
const DECK_ADD_OTHER_OPTIONS = CREATE_MATERIAL_OPTIONS.filter((o) => o.type !== 'flashcards')

export default function WorkspacePage({
  workspace,
  stackDepth,
  onPageChange,
  onOpenSubWorkspace,
  onBackInStack,
  onOpenLecture,
  onOpenDeckDetails,
  onOpenStudyAll,
  onOpenCreateMaterial,
  onOpenCardEditor,
  onOpenPodcast,
}: WorkspacePageProps) {
  const { userId } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('Cards')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMenuClosing, setIsMenuClosing] = useState(false)
  const [studyDeckScopeOpen, setStudyDeckScopeOpen] = useState(false)
  const [studyDeckScopeClosing, setStudyDeckScopeClosing] = useState(false)
  const [generateMenuOpen, setGenerateMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subWorkspaces, setSubWorkspaces] = useState<WsSubWorkspace[]>([])
  const [cards, setCards] = useState<WsFlashcard[]>([])
  const [notes, setNotes] = useState<WsLectureNote[]>([])
  const [studyGuides, setStudyGuides] = useState<WsStudyGuide[]>([])
  const [podcasts, setPodcasts] = useState<WsPodcast[]>([])
  const [decks, setDecks] = useState<{ id: string; title: string; workspaceId: string | null }[]>([])
  const [isSubdeck, setIsSubdeck] = useState(false)
  const [displayTitle, setDisplayTitle] = useState(workspace.title)
  const [displayColor, setDisplayColor] = useState(workspace.colorHex)
  const [stats, setStats] = useState({ cardCount: 0, mastery: 0, subdeckCount: 0 })
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameClosing, setRenameClosing] = useState(false)
  const [subdeckOpen, setSubdeckOpen] = useState(false)
  const [subdeckClosing, setSubdeckClosing] = useState(false)
  const [modalName, setModalName] = useState('')
  const [addCardOpen, setAddCardOpen] = useState(false)
  const [cardFront, setCardFront] = useState('')
  const [cardBack, setCardBack] = useState('')
  const [saving, setSaving] = useState(false)
  const [openCardMenu, setOpenCardMenu] = useState<string | null>(null)
  const [openCardMenuClosing, setOpenCardMenuClosing] = useState<string | null>(null)
  const [openNoteMenu, setOpenNoteMenu] = useState<string | null>(null)
  const [openNoteMenuClosing, setOpenNoteMenuClosing] = useState<string | null>(null)
  const [openGuideMenu, setOpenGuideMenu] = useState<string | null>(null)
  const [openGuideMenuClosing, setOpenGuideMenuClosing] = useState<string | null>(null)
  const [openPodcastMenu, setOpenPodcastMenu] = useState<string | null>(null)
  const [openPodcastMenuClosing, setOpenPodcastMenuClosing] = useState<string | null>(null)
  const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null)


  const closeMainMenu = () => {
    setIsMenuClosing(true)
    setTimeout(() => {
      setIsMenuOpen(false)
      setIsMenuClosing(false)
    }, 200)
  }

  const closeStudyScope = () => {
    setStudyDeckScopeClosing(true)
    setTimeout(() => {
      setStudyDeckScopeOpen(false)
      setStudyDeckScopeClosing(false)
    }, 200)
  }

  const closeCardMenu = () => {
    if (!openCardMenu) return
    setOpenCardMenuClosing(openCardMenu)
    setTimeout(() => {
      setOpenCardMenu(null)
      setOpenCardMenuClosing(null)
    }, 200)
  }

  const toggleCardMenu = (id: string) => {
    if (openCardMenu === id) closeCardMenu()
    else setOpenCardMenu(id)
  }

  const closeNoteMenu = () => {
    if (!openNoteMenu) return
    setOpenNoteMenuClosing(openNoteMenu)
    setTimeout(() => {
      setOpenNoteMenu(null)
      setOpenNoteMenuClosing(null)
    }, 200)
  }

  const toggleNoteMenu = (id: string) => {
    if (openNoteMenu === id) closeNoteMenu()
    else setOpenNoteMenu(id)
  }

  const closeGuideMenu = () => {
    if (!openGuideMenu) return
    setOpenGuideMenuClosing(openGuideMenu)
    setTimeout(() => {
      setOpenGuideMenu(null)
      setOpenGuideMenuClosing(null)
    }, 200)
  }

  const toggleGuideMenu = (id: string) => {
    if (openGuideMenu === id) closeGuideMenu()
    else setOpenGuideMenu(id)
  }

  const closePodcastMenu = () => {
    if (!openPodcastMenu) return
    setOpenPodcastMenuClosing(openPodcastMenu)
    setTimeout(() => {
      setOpenPodcastMenu(null)
      setOpenPodcastMenuClosing(null)
    }, 200)
  }

  const togglePodcastMenu = (id: string) => {
    if (openPodcastMenu === id) closePodcastMenu()
    else setOpenPodcastMenu(id)
  }

  const closeRename = () => {
    setRenameClosing(true)
    setTimeout(() => {
      setRenameOpen(false)
      setRenameClosing(false)
    }, 200)
  }

  const closeSubdeck = () => {
    setSubdeckClosing(true)
    setTimeout(() => {
      setSubdeckOpen(false)
      setSubdeckClosing(false)
    }, 200)
  }

  const load = useCallback(async (opts?: { isRefresh?: boolean }) => {
    if (!userId) {
      setLoading(false)
      return
    }
    if (!opts?.isRefresh) {
      setLoading(true)
    }
    setError(null)
    try {
      const b = await fetchWorkspaceBundle(workspace.id, userId)
      if (b.workspace) {
        setDisplayTitle(b.workspace.title)
        setDisplayColor(b.workspace.colorHex)
        setIsSubdeck(!!b.workspace.parentId)
      } else {
        setDisplayTitle(workspace.title)
        setDisplayColor(workspace.colorHex)
        setIsSubdeck(false)
      }
      setSubWorkspaces(b.subWorkspaces)
      setCards(b.cards)
      setNotes(b.notes)
      setStudyGuides(b.studyGuides)
      setPodcasts(b.podcasts)
      setDecks(b.decks)
      setStats(b.stats)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load workspace')
    } finally {
      if (!opts?.isRefresh) {
        setLoading(false)
      }
    }
  }, [userId, workspace.id, workspace.title, workspace.colorHex])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch bundle when workspace or userId changes
    void load()
  }, [load])

  const goBack = () => {
    if (stackDepth > 1) onBackInStack()
    else onPageChange('library')
  }

  const openDeckDetails = (t: DeckDetailsTarget) => {
    setStudyDeckScopeOpen(false)
    onOpenDeckDetails(t)
  }

  const handleStudyDeckClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // We allow clicking even if count is 0 to allow the target page to handle recursive loading or empty states
    if (!isSubdeck && subWorkspaces.length > 0) {
      setStudyDeckScopeOpen(true)
      return
    }
    openDeckDetails({
      workspaceId: workspace.id,
      studyAll: false,
      title: displayTitle,
      colorHex: displayColor,
    })
  }

  const handleStudyAllClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // We allow clicking even if count is 0 to allow the target page to handle recursive loading or empty states
    onOpenStudyAll({
      workspaceId: workspace.id,
      title: displayTitle,
      colorHex: displayColor,
    })
  }

  const handleRenameSave = async () => {
    if (!modalName.trim() || !supabase) return
    setSaving(true)
    try {
      await supabase.from('workspaces').update({ title: modalName.trim() }).eq('id', workspace.id)
      closeRename()
      await load({ isRefresh: true })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Rename failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSubdeckSave = async () => {
    if (!modalName.trim() || !userId) return
    setSaving(true)
    try {
      const created = await createWorkspace(userId, modalName.trim(), displayColor, workspace.id)
      onOpenSubWorkspace({ id: created.id, title: created.title, colorHex: created.colorHex })
      closeSubdeck()
      setModalName('')
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not create Sub Deck')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspaceCascading(workspace.id)
      addTrashItem({ kind: 'workspace', id: workspace.id, title: displayTitle })
      onPageChange('library')
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleAddCardSave = async () => {
    if (!userId || !cardFront.trim()) return
    setSaving(true)
    try {
      let deckId = getPreferredFlashcardDeckId(decks, notes)
      if (!deckId) {
        const newId = await createDeckInWorkspace(userId, 'Flashcards', workspace.id)
        setDecks((d) => [...d, { id: newId, title: 'Flashcards', workspaceId: workspace.id }])
        deckId = newId
      }
      await addCardsToDeck(deckId, [{ front: cardFront.trim(), back: cardBack.trim() }])
      setAddCardOpen(false)
      await load({ isRefresh: true })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not add card')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLecture = async (id: string) => {
    if (!supabase) return
    const note = notes.find((n) => n.id === id)
    const { error: err } = await supabase.from('transcripts').delete().eq('id', id)
    if (err) {
      window.alert(err.message)
      return
    }
    addTrashItem({
      kind: 'lecture',
      id,
      title: note?.title ?? 'Lecture',
      subtitle: note?.date,
    })
    await load({ isRefresh: true })
  }

  const handleDeleteGuide = async (id: string) => {
    if (!supabase) return
    const g = studyGuides.find((x) => x.id === id)
    const { error: err } = await supabase.from('study_guides').delete().eq('id', id)
    if (err) {
      window.alert(err.message)
      return
    }
    addTrashItem({
      kind: 'study_guide',
      id,
      title: g?.title ?? 'Study guide',
      subtitle: g?.topic ?? undefined,
    })
    await load({ isRefresh: true })
  }

  const handleDeletePodcast = async (id: string) => {
    if (!supabase) return
    const p = podcasts.find((x) => x.id === id)
    const { error: err } = await supabase.from('podcasts').delete().eq('id', id)
    if (err) {
      window.alert(err.message)
      return
    }
    addTrashItem({
      kind: 'podcast' as any,
      id,
      title: p?.title ?? 'Podcast',
    })
    await load({ isRefresh: true })
  }

  // Hold-to-delete logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isDeleteHolding) {
      timer = setTimeout(() => {
        const id = isDeleteHolding
        setIsDeleteHolding(null)
        if (id === 'workspace') void handleDeleteWorkspace()
        else if (id.startsWith('card-')) void deleteFlashcard(id.replace('card-', ''))
        else if (id.startsWith('lec-')) void handleDeleteLecture(id.replace('lec-', ''))
        else if (id.startsWith('sg-')) void handleDeleteGuide(id.replace('sg-', ''))
        else if (id.startsWith('pod-')) void handleDeletePodcast(id.replace('pod-', ''))
        if (id.startsWith('card-') || id.startsWith('lec-') || id.startsWith('sg-') || id.startsWith('pod-')) void load({ isRefresh: true })
      }, 1000)
    }
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-run when hold id changes
  }, [isDeleteHolding])

  if (loading && cards.length === 0 && !error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-foreground-secondary min-h-[50vh]">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm">Loading workspace…</p>
      </div>
    )
  }

  return (
    <div
      id="workspace-scroll-container"
      className="w-full h-full overflow-y-scroll relative bg-background"
      onClick={() => {
        setIsMenuOpen(false)
        setOpenCardMenu(null)
        setOpenNoteMenu(null)
        setOpenGuideMenu(null)
        setGenerateMenuOpen(false)
      }}
    >
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        </div>
      )}

      <div className="sticky top-14 md:top-0 z-10 bg-surface">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-2">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goBack()
                }}
                className="p-2 hover:bg-surface-hover rounded-full text-foreground transition-colors shrink-0"
                aria-label="Back"
              >
                <ChevronLeft size={24} />
              </button>
              <div
                className="w-8 h-8 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: displayColor || '#3B82F6' }}
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">{displayTitle}</h1>
                <p className="text-xs text-foreground-secondary">
                  {stats.cardCount} cards
                  {stats.subdeckCount > 0 && !isSubdeck ? ` · ${stats.subdeckCount} Sub Decks` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isMenuOpen) closeMainMenu()
                    else setIsMenuOpen(true)
                  }}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isMenuOpen
                      ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                >
                  <MoreVertical 
                    size={20} 
                    className={isMenuOpen ? 'popover-menu-trigger-rotate' : ''} 
                  />
                </button>
              { (isMenuOpen || isMenuClosing) && (
                <div className={`absolute right-0 mt-3 w-56 z-50 text-left popover-menu-surface p-1.5 shadow-2xl ${isMenuClosing ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}>
                  {!isSubdeck && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setSubdeckOpen(true)
                        setModalName('')
                      }}
                    >
                      <Plus size={16} className="text-zinc-500 shrink-0" /> Add Sub Deck
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onOpenCardEditor({
                        title: displayTitle,
                        cards: cards,
                        orderStorageKey: `workspace-order-${workspace.id}`,
                      })
                    }}
                  >
                    <Layers size={16} className="text-zinc-500 shrink-0" />
                    Editor
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                    onClick={() => {
                      setIsMenuOpen(false)
                      setRenameOpen(true)
                      setModalName(displayTitle)
                    }}
                  >
                    <Edit2 size={16} className="text-zinc-500 shrink-0" />
                    Rename
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                    onClick={async () => {
                      setIsMenuOpen(false)
                      try {
                        await navigator.clipboard.writeText(
                          `Hey! Check out my "${displayTitle}" study deck on Viszmo. It has ${stats.cardCount} cards. 🚀`
                        )
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    <Share2 size={16} className="text-zinc-500 shrink-0" />
                    Copy share blurb
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                  <button
                    type="button"
                    className={`hold-to-delete-container ${isDeleteHolding === 'workspace' ? 'hold-to-delete-active' : ''}`}
                    onMouseDown={() => setIsDeleteHolding('workspace')}
                    onMouseUp={() => setIsDeleteHolding(null)}
                    onMouseLeave={() => setIsDeleteHolding(null)}
                    onTouchStart={() => setIsDeleteHolding('workspace')}
                    onTouchEnd={() => setIsDeleteHolding(null)}
                  >
                    <div className="hold-to-delete-progress" />
                    <div className="relative z-10 flex items-center gap-2.5 w-full">
                      <Trash2 size={16} className="shrink-0" />
                      <span className="font-semibold">
                        {isDeleteHolding === 'workspace' ? 'Hold to confirm' : 'Delete workspace'}
                      </span>
                    </div>
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
                      setGenerateMenuOpen((o) => !o)
                    }}
                    className="px-5 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-hover text-foreground font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                    aria-haspopup="menu"
                    aria-expanded={generateMenuOpen}
                  >
                    <Plus size={16} />
                    Add
                  </button>
                  {generateMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-[min(100vw-2rem,20rem)] z-50 text-left popover-menu-surface p-1.5 popover-menu-dropdown-animate shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                      role="menu"
                    >
                      <p className="px-2 pt-1 pb-2 text-[10px] font-black uppercase tracking-widest text-foreground-secondary">
                        Add to this deck
                      </p>
                      {CREATE_MATERIAL_OPTIONS.map((opt) => (
                        <button
                          key={opt.type}
                          type="button"
                          role="menuitem"
                          className="w-full flex items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-hover transition-colors"
                          onClick={() => {
                            setGenerateMenuOpen(false)
                            setActiveTab(opt.tab)
                            onOpenCreateMaterial(opt.type, {
                              cardCount: stats.cardCount,
                              title: displayTitle,
                              color: displayColor,
                            })
                          }}
                        >
                          {opt.icon}
                          <span className="min-w-0">
                            <span className="block font-bold text-foreground text-sm">{opt.label}</span>
                            <span className="block text-xs text-foreground-secondary mt-0.5 leading-snug">
                              {opt.description}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!isSubdeck && subWorkspaces.length > 0 && (
                  <button
                    type="button"
                    onClick={handleStudyAllClick}
                    className="px-5 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-hover text-foreground font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Play size={16} />
                    Study All
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleStudyDeckClick}
                  className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <Play size={16} className="fill-white" />
                  Study Deck
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 flex gap-8">
            {tabs.map((tab) => (
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

      <div className="max-w-4xl mx-auto py-8 px-6 pb-40 min-h-[70vh]">
        {activeTab === 'Cards' && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            {!isSubdeck && (
              <div>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="font-bold text-foreground">Sub Decks ({subWorkspaces.length})</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {subWorkspaces.map((sw) => (
                    <button
                      key={sw.id}
                      type="button"
                      onClick={() =>
                        onOpenSubWorkspace({ id: sw.id, title: sw.title, colorHex: sw.colorHex })
                      }
                      className="group flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 text-left hover:border-brand-primary/50 transition-all w-full"
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: sw.colorHex || '#3B82F6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary">{sw.title}</h3>
                        <p className="text-sm text-foreground-secondary">
                          {sw.stats.cardCount} cards
                          {sw.stats.subdeckCount > 0 && ` · ${sw.stats.subdeckCount} Sub Decks`}
                        </p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSubdeckOpen(true)
                      setModalName('')
                    }}
                    className="flex items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50 w-full"
                  >
                    <Plus size={20} />
                    <span className="font-medium">Create Sub Deck</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <h2 className="font-bold text-foreground mb-4 px-2">Cards ({cards.filter((c) => c.front?.trim() || c.back?.trim()).length})</h2>
              <div className="flex flex-col gap-3">
                {cards
                  .filter((c) => c.front?.trim() || c.back?.trim())
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-surface border border-border rounded-2xl p-4 relative"
                      onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-sm font-semibold text-foreground line-clamp-3 pr-1">
                          {card.front || '—'}
                        </p>
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCardMenu(card.id)
                            }}
                            className={`p-1.5 rounded-full transition-all duration-300 ${
                              openCardMenu === card.id
                                ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                            }`}
                            aria-label="Card actions"
                          >
                            <MoreVertical 
                              size={16} 
                              className={openCardMenu === card.id ? 'popover-menu-trigger-rotate' : ''} 
                            />
                          </button>
                          { (openCardMenu === card.id || openCardMenuClosing === card.id) && (
                            <div className={`absolute right-0 top-11 w-44 z-20 p-1.5 popover-menu-surface shadow-2xl ${openCardMenuClosing === card.id ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}>
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-lg text-left"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenCardMenu(null)
                                  onOpenDeckDetails({
                                    workspaceId: workspace.id,
                                    studyAll: false,
                                    title: displayTitle,
                                    colorHex: displayColor,
                                  })
                                }}
                              >
                                <Play size={12} className="text-zinc-500 shrink-0" />
                                Details
                              </button>
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-lg text-left"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenCardMenu(null)
                                  onOpenCardEditor({
                                    title: displayTitle,
                                    cards: cards,
                                    orderStorageKey: `workspace-order-${workspace.id}`,
                                    initialCardId: card.id
                                  })
                                }}
                              >
                                <Edit2 size={12} className="text-zinc-500 shrink-0" />
                                Edit
                              </button>
                              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-1" />
                              <button
                                type="button"
                                className={`hold-to-delete-container ${isDeleteHolding === `card-${card.id}` ? 'hold-to-delete-active' : ''}`}
                                onMouseDown={() => setIsDeleteHolding(`card-${card.id}`)}
                                onMouseUp={() => setIsDeleteHolding(null)}
                                onMouseLeave={() => setIsDeleteHolding(null)}
                                onTouchStart={() => setIsDeleteHolding(`card-${card.id}`)}
                                onTouchEnd={() => setIsDeleteHolding(null)}
                              >
                                <div className="hold-to-delete-progress" />
                                <div className="relative z-10 flex items-center gap-2 w-full">
                                  <Trash2 size={12} className="shrink-0" />
                                  <span className="font-semibold text-[10px]">
                                    {isDeleteHolding === `card-${card.id}` ? 'Hold to confirm' : 'Delete'}
                                  </span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="h-px bg-border -mx-4 w-[calc(100%+2rem)] my-2.5" />
                      <p className="text-sm text-foreground-secondary line-clamp-6 whitespace-pre-wrap pr-2">{card.back || '—'}</p>
                    </div>
                  ))}
                <div className="relative w-full z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setGenerateMenuOpen(false)
                      onOpenCreateMaterial('flashcards', {
                        cardCount: stats.cardCount,
                        title: displayTitle,
                        color: displayColor,
                      })
                    }}
                    className="flex w-full items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50"
                    aria-label="Add flashcard — choose how"
                  >
                    <Plus size={20} className="shrink-0" />
                    <span className="min-w-0 flex-1 text-left font-medium">Add flashcard</span>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-foreground-muted"
                      aria-hidden
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Lectures' && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            {notes.length === 0 ? (
              <div className="border border-dashed border-border rounded-3xl bg-surface-hover/20 px-6 py-10 text-center">
                <p className="text-lg font-bold text-foreground">No lectures in this deck</p>
                <p className="text-sm text-foreground-secondary mt-2 max-w-md mx-auto">
                  Record your first lecture to see it here and generate study materials.
                </p>
                <button
                  type="button"
                  onClick={() => onPageChange('home')}
                  className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-colors"
                >
                  Record Lecture
                </button>
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="group flex items-center justify-between bg-sky-900/15 border border-brand-primary/10 rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="flex items-center gap-4 flex-1 text-left min-w-0"
                    onClick={() =>
                      onOpenLecture({
                        id: n.id,
                        title: n.title,
                        date: n.date,
                        duration: n.duration,
                      })
                    }
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Mic size={20} className="text-brand-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-foreground-secondary font-medium">
                        <span>{n.date}</span>
                        <span>•</span>
                        <span>{n.duration}</span>
                      </div>
                    </div>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleNoteMenu(n.id)
                      }}
                      className={`p-1.5 rounded-full transition-all duration-300 ${
                        openNoteMenu === n.id
                          ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                      }`}
                      aria-label="Lecture actions"
                    >
                      <MoreVertical 
                        size={16} 
                        className={openNoteMenu === n.id ? 'popover-menu-trigger-rotate' : ''} 
                      />
                    </button>
                    { (openNoteMenu === n.id || openNoteMenuClosing === n.id) && (
                      <div className={`absolute right-0 top-11 w-44 z-20 p-1.5 popover-menu-surface shadow-2xl ${openNoteMenuClosing === n.id ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}>
                        <button
                          type="button"
                          className={`hold-to-delete-container py-2 ${isDeleteHolding === `lec-${n.id}` ? 'hold-to-delete-active' : ''}`}
                          onMouseDown={() => setIsDeleteHolding(`lec-${n.id}`)}
                          onMouseUp={() => setIsDeleteHolding(null)}
                          onMouseLeave={() => setIsDeleteHolding(null)}
                          onTouchStart={() => setIsDeleteHolding(`lec-${n.id}`)}
                          onTouchEnd={() => setIsDeleteHolding(null)}
                        >
                          <div className="hold-to-delete-progress" />
                          <div className="relative z-10 flex items-center gap-2 w-full">
                            <Trash2 size={12} className="shrink-0" />
                            <span className="font-bold text-[10px]">
                              {isDeleteHolding === `lec-${n.id}` ? 'Hold to confirm' : 'Delete'}
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Study Guides' && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            {studyGuides.length === 0 ? (
              <div className="border border-dashed border-border rounded-3xl bg-surface-hover/20 px-6 py-10 text-center">
                <p className="text-lg font-bold text-foreground">No study guides for this deck yet</p>
                <p className="text-sm text-foreground-secondary mt-2 max-w-md mx-auto">
                  Generate a study guide from this deck, a lecture, or the create menu.
                </p>
                <button
                  type="button"
                  onClick={() => onPageChange('home')}
                  className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-colors"
                >
                  Create Study Guide
                </button>
              </div>
            ) : (
              studyGuides.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between bg-surface border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <BookMarked size={20} className="text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{g.title}</h3>
                      {g.topic && <p className="text-sm text-foreground-secondary truncate">{g.topic}</p>}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleGuideMenu(g.id)
                      }}
                      className={`p-1.5 rounded-full transition-all duration-300 ${
                        openGuideMenu === g.id
                          ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                      }`}
                      aria-label="Guide actions"
                    >
                      <MoreVertical 
                        size={16} 
                        className={openGuideMenu === g.id ? 'popover-menu-trigger-rotate' : ''} 
                      />
                    </button>
                    { (openGuideMenu === g.id || openGuideMenuClosing === g.id) && (
                      <div className={`absolute right-0 top-11 w-44 z-20 p-1.5 popover-menu-surface shadow-2xl ${openGuideMenuClosing === g.id ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}>
                        <button
                          type="button"
                          className={`hold-to-delete-container ${isDeleteHolding === `sg-${g.id}` ? 'hold-to-delete-active' : ''}`}
                          onMouseDown={() => setIsDeleteHolding(`sg-${g.id}`)}
                          onMouseUp={() => setIsDeleteHolding(null)}
                          onMouseLeave={() => setIsDeleteHolding(null)}
                          onTouchStart={() => setIsDeleteHolding(`sg-${g.id}`)}
                          onTouchEnd={() => setIsDeleteHolding(null)}
                        >
                          <div className="hold-to-delete-progress" />
                          <div className="relative z-10 flex items-center gap-2 w-full">
                            <Trash2 size={12} className="shrink-0" />
                            <span className="font-semibold text-[10px]">
                              {isDeleteHolding === `sg-${g.id}` ? 'Hold to confirm' : 'Delete'}
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Podcasts' && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            {podcasts.length > 0 && (
              <div>
                <h2 className="font-bold text-foreground mb-4 px-2">Saved Podcasts ({podcasts.length})</h2>
                <div className="flex flex-col gap-3">
                  {podcasts.map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/50 transition-all shadow-sm w-full text-left"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPodcast({
                            title: p.title,
                            content: '',
                            workspaceId: workspace.id,
                            initialScript: p.script,
                          })
                        }
                        className="flex items-center gap-4 flex-1 min-w-0 text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                          <Podcast size={20} className="text-purple-500" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                            {p.title}
                          </h3>
                          <div className="text-sm text-foreground-secondary font-medium italic">Viszmo Podcast Episode</div>
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePodcastMenu(p.id)
                            }}
                            className={`p-1.5 rounded-full transition-all duration-300 ${
                              openPodcastMenu === p.id
                                ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                            }`}
                          >
                            <MoreVertical size={16} className={openPodcastMenu === p.id ? 'popover-menu-trigger-rotate' : ''} />
                          </button>
                          { (openPodcastMenu === p.id || openPodcastMenuClosing === p.id) && (
                            <div className={`absolute right-0 top-11 w-44 z-20 p-1.5 popover-menu-surface shadow-2xl ${openPodcastMenuClosing === p.id ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}>
                              <button
                                type="button"
                                className={`hold-to-delete-container py-2 ${isDeleteHolding === `pod-${p.id}` ? 'hold-to-delete-active' : ''}`}
                                onMouseDown={() => setIsDeleteHolding(`pod-${p.id}`)}
                                onMouseUp={() => setIsDeleteHolding(null)}
                                onMouseLeave={() => setIsDeleteHolding(null)}
                                onTouchStart={() => setIsDeleteHolding(`pod-${p.id}`)}
                                onTouchEnd={() => setIsDeleteHolding(null)}
                              >
                                <div className="hold-to-delete-progress" />
                                <div className="relative z-10 flex items-center gap-2 w-full">
                                  <Trash2 size={12} className="shrink-0" />
                                  <span className="font-bold text-[10px]">
                                    {isDeleteHolding === `pod-${p.id}` ? 'Hold to confirm' : 'Delete'}
                                  </span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenPodcast({
                              title: p.title,
                              content: '',
                              workspaceId: workspace.id,
                              initialScript: p.script,
                            })
                          }
                          className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all"
                        >
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              {podcasts.length > 0 && <h2 className="font-bold text-foreground mb-4 px-2">Generate New</h2>}
              <div className="border border-dashed border-border rounded-3xl bg-surface-hover/20 px-6 py-10 text-center">
                <p className="text-lg font-bold text-foreground">
                  {podcasts.length > 0 ? 'Create another Podcast' : 'Turn this deck into a Podcast'}
                </p>
                <p className="text-sm text-foreground-secondary mt-2 max-w-md mx-auto">
                  Viszmo will generate an engaging host-style dialogue summarizing your cards and notes.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const content = cards.map(c => `Term: ${c.front}\nDefinition: ${c.back}`).join('\n\n')
                    onOpenPodcast({ title: displayTitle, content, workspaceId: workspace.id })
                  }}
                  disabled={cards.length === 0}
                  className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-40"
                >
                  <Waves size={18} />
                  Generate Podcast
                </button>
              </div>
            </div>
          </div>
        )}

        { (renameOpen || renameClosing) && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60" onClick={closeRename}>
          <div
            className={`bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl ${renameClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-3">Rename workspace</h3>
            <input
              className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2 text-foreground mb-4"
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={closeRename} className="px-4 py-2 text-foreground-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      { (subdeckOpen || subdeckClosing) && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60" onClick={closeSubdeck}>
          <div
            className={`bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl ${subdeckClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-3">New Sub Deck</h3>
            <input
              className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2 text-foreground mb-4"
              value={modalName}
              placeholder="Deck title..."
              onChange={(e) => setModalName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={closeSubdeck} className="px-4 py-2 text-foreground-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubdeckSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold"
              >
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {addCardOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60"
          onClick={() => {
            setAddCardOpen(false)
          }}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-foreground">Add flashcard</h3>
              <button
                type="button"
                onClick={() => {
                  setAddCardOpen(false)
                }}
                className="p-1 rounded-lg hover:bg-surface-hover"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <label className="text-xs font-bold text-foreground-secondary uppercase">Front</label>
            <textarea
              className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2 text-foreground mb-3 min-h-[80px]"
              value={cardFront}
              onChange={(e) => setCardFront(e.target.value)}
            />
            <label className="text-xs font-bold text-foreground-secondary uppercase">Back</label>
            <textarea
              className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2 text-foreground mb-4 min-h-[100px]"
              value={cardBack}
              onChange={(e) => setCardBack(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddCardSave}
                disabled={saving || !cardFront.trim()}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      { (studyDeckScopeOpen || studyDeckScopeClosing) && (
        <div
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/60"
          onClick={closeStudyScope}
        >
          <div
            className={`w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-5 max-h-[min(80vh,520px)] flex flex-col ${studyDeckScopeClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-lg font-bold text-foreground">What do you want to study?</h3>
              <button
                type="button"
                onClick={closeStudyScope}
                className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-secondary hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-foreground-secondary mb-4">Choose a scope, then set modes on the next screen.</p>
            <div className="overflow-y-auto flex flex-col gap-2 pr-1">
              <button
                type="button"
                onClick={() =>
                  openDeckDetails({
                    workspaceId: workspace.id,
                    studyAll: true,
                    title: displayTitle,
                    colorHex: displayColor,
                  })
                }
                className="w-full text-left rounded-xl border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors p-4"
              >
                <div className="font-bold text-foreground">Study all decks</div>
                <div className="text-sm text-foreground-secondary mt-0.5">
                  {stats.cardCount} cards · Includes all Sub Decks
                </div>
              </button>
              <div className="h-px bg-border my-1" />
              <button
                type="button"
                onClick={() =>
                  openDeckDetails({
                    workspaceId: workspace.id,
                    studyAll: false,
                    title: displayTitle,
                    colorHex: displayColor,
                  })
                }
                className="w-full text-left rounded-xl border border-border bg-surface-hover/50 hover:bg-surface-hover p-4 transition-colors"
              >
                <div className="font-bold text-foreground">Main deck</div>
                <div className="text-sm text-foreground-secondary mt-0.5">
                  {cards.length} cards · {displayTitle}
                </div>
              </button>
              {subWorkspaces.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() =>
                    openDeckDetails({
                      workspaceId: sw.id,
                      studyAll: false,
                      title: sw.title,
                      colorHex: sw.colorHex,
                    })
                  }
                  className="w-full text-left rounded-xl border border-border bg-surface-hover/50 hover:bg-surface-hover p-4 transition-colors"
                >
                  <div className="font-bold text-foreground">{sw.title}</div>
                  <div className="text-sm text-foreground-secondary mt-0.5">
                    {sw.stats.cardCount} cards · Sub Deck
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
