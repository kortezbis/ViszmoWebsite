import { useCallback, useEffect, useState } from 'react'
import { MoreVertical, FolderOpen, Trash2, Mic, BookMarked, Edit2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { fetchLibrarySnapshot, type LibraryLecture, type LibraryStudyGuide, type LibraryWorkspace } from '../lib/libraryData'
import { addTrashItem } from '../lib/browserTrash'

type TabId = 'Library' | 'Lectures' | 'Study Guides'

export type LibraryOpenWorkspace = { id: string; title: string; colorHex: string }
export type LibraryOpenLecture = { id: string; title: string; date: string; duration: string }
type RenameTargetType = 'myDecks' | 'lecture' | 'studyGuides'

type LibraryPageProps = {
  onOpenWorkspace: (w: LibraryOpenWorkspace) => void
  onOpenLecture: (l: LibraryOpenLecture) => void
}

export default function LibraryPage({ onOpenWorkspace, onOpenLecture }: LibraryPageProps) {
  const { userId, isSignedIn } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('Library')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [closingMenuId, setClosingMenuId] = useState<string | null>(null)
  const [workspaces, setWorkspaces] = useState<LibraryWorkspace[]>([])
  const [lectures, setLectures] = useState<LibraryLecture[]>([])
  const [studyGuides, setStudyGuides] = useState<LibraryStudyGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isRenameModalClosing, setIsRenameModalClosing] = useState(false)
  const [renameText, setRenameText] = useState('')
  const [renameSaving, setRenameSaving] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; type: RenameTargetType } | null>(null)
  const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null)
  const tabs: TabId[] = ['Library', 'Lectures', 'Study Guides']

  const load = useCallback(async (opts?: { isRefresh?: boolean }) => {
    if (!userId || !isSignedIn) {
      setWorkspaces([])
      setLectures([])
      setStudyGuides([])
      setLoading(false)
      return
    }
    if (!opts?.isRefresh) {
      setLoading(true)
    }
    setError(null)
    try {
      const data = await fetchLibrarySnapshot(userId)
      setWorkspaces(data.workspaces)
      setLectures(data.lectures)
      setStudyGuides(data.studyGuides)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load library')
    } finally {
      setLoading(false)
    }
  }, [userId, isSignedIn])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch library lists on mount / when userId changes
    void load()
  }, [load])

  const closeMenu = () => {
    if (!activeMenuId) return
    setClosingMenuId(activeMenuId)
    setTimeout(() => {
      setActiveMenuId(null)
      setClosingMenuId(null)
    }, 200)
  }

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (activeMenuId === id) {
      closeMenu()
    } else {
      setActiveMenuId(id)
    }
  }

  const renameModalLabel = (type: RenameTargetType): string => {
    if (type === 'myDecks') return 'Library'
    if (type === 'lecture') return 'Lecture'
    return 'Study Guide'
  }

  const openRename = (id: string, currentTitle: string, type: RenameTargetType) => {
    setActiveMenuId(null)
    setRenameTarget({ id, type })
    setRenameText(currentTitle)
    setIsRenameModalOpen(true)
  }

  const deleteWorkspace = async (id: string) => {
    if (!supabase) return
    const title = workspaces.find((w) => w.id === id)?.title ?? 'Workspace'
    const { error: err } = await supabase.from('workspaces').delete().eq('id', id)
    if (err) {
      window.alert(err.message)
      return
    }
    addTrashItem({ kind: 'workspace', id, title })
    setActiveMenuId(null)
    void load()
  }

  const deleteLecture = async (id: string) => {
    if (!supabase) return
    const lec = lectures.find((l) => l.id === id)
    const { error: err } = await supabase.from('transcripts').delete().eq('id', id)
    if (err) {
      window.alert(err.message)
      return
    }
    addTrashItem({
      kind: 'lecture',
      id,
      title: lec?.title ?? 'Lecture',
      subtitle: lec?.date,
    })
    setActiveMenuId(null)
    void load()
  }

  const deleteStudyGuide = async (id: string) => {
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
    setActiveMenuId(null)
    setActiveMenuId(null)
    void load()
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isDeleteHolding) {
      timer = setTimeout(() => {
        const id = isDeleteHolding
        setIsDeleteHolding(null)
        if (id.startsWith('ws-')) void deleteWorkspace(id.replace('ws-', ''))
        else if (id.startsWith('lec-')) void deleteLecture(id.replace('lec-', ''))
        else if (id.startsWith('sg-')) void deleteStudyGuide(id.replace('sg-', ''))
      }, 1000)
    }
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleteHolding])

  const closeRenameModal = () => {
    setIsRenameModalClosing(true)
    setTimeout(() => {
      setIsRenameModalOpen(false)
      setIsRenameModalClosing(false)
    }, 200)
  }

  const handleRenameSave = async () => {
    if (!supabase || !renameTarget || !renameText.trim()) return
    setRenameSaving(true)
    const table = renameTarget.type === 'myDecks' ? 'workspaces' : renameTarget.type === 'lecture' ? 'transcripts' : 'study_guides'
    try {
      await supabase.from(table).update({ title: renameText.trim() }).eq('id', renameTarget.id)
      closeRenameModal()
      void load()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Rename failed')
    } finally {
      setRenameSaving(false)
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto" onClick={closeMenu}>
      <div className="sticky top-14 md:top-0 z-10 bg-surface">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-foreground mb-2">Library</h1>
              <p className="text-foreground-secondary">Manage and organize all your study materials here.</p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">{error}</p>
          )}
        </div>

        <div className="border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium transition-all relative ${
                  activeTab === tab
                    ? 'text-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
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

      <div className="max-w-4xl mx-auto px-6 py-8 pb-40">
        {activeTab === 'Library' && (
          <div>
            <h4 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-4">Library</h4>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-3xl bg-surface-hover/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Your library is empty</h3>
                <p className="text-foreground-secondary text-sm text-center max-w-md">
                  Create a library in the app to see it here with card and Sub Deck counts.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/50 transition-all shadow-sm relative"
                  >
                    <button
                      type="button"
                      className="flex items-center gap-4 flex-1 text-left min-w-0"
                      onClick={() =>
                        onOpenWorkspace({ id: ws.id, title: ws.title, colorHex: ws.colorHex })
                      }
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: ws.colorHex }}
                      />
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                          {ws.title}
                        </h3>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-sm text-foreground-secondary font-medium">
                          <span>{ws.stats.cardCount} cards</span>
                          {ws.stats.subdeckCount > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {ws.stats.subdeckCount} Sub Deck{ws.stats.subdeckCount !== 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span
                            className={
                              ws.stats.mastery > 0 ? 'text-emerald-400 font-bold' : 'text-foreground-secondary'
                            }
                          >
                            {ws.stats.mastery}% Mastery
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="relative shrink-0">
                        <button
                          type="button"
                          className={`p-2 rounded-full transition-all duration-300 ${
                            activeMenuId === `ws-${ws.id}`
                              ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                          }`}
                          onClick={(e) => toggleMenu(e, `ws-${ws.id}`)}
                          aria-label="Library actions"
                        >
                          <MoreVertical 
                            size={20} 
                            className={activeMenuId === `ws-${ws.id}` ? 'popover-menu-trigger-rotate' : ''} 
                          />
                        </button>
                      { (activeMenuId === `ws-${ws.id}` || closingMenuId === `ws-${ws.id}`) && (
                        <div
                          className={`absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl ${closingMenuId === `ws-${ws.id}` ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                            onClick={() => onOpenWorkspace({ id: ws.id, title: ws.title, colorHex: ws.colorHex })}
                          >
                            <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                            Open
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                            onClick={() => openRename(ws.id, ws.title, 'myDecks')}
                          >
                            <Edit2 size={16} className="text-zinc-500 shrink-0" />
                            Rename
                          </button>
                          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                          <button
                            type="button"
                            className={`hold-to-delete-container ${isDeleteHolding === `ws-${ws.id}` ? 'hold-to-delete-active' : ''}`}
                            onMouseDown={() => setIsDeleteHolding(`ws-${ws.id}`)}
                            onMouseUp={() => setIsDeleteHolding(null)}
                            onMouseLeave={() => setIsDeleteHolding(null)}
                            onTouchStart={() => setIsDeleteHolding(`ws-${ws.id}`)}
                            onTouchEnd={() => setIsDeleteHolding(null)}
                          >
                            <div className="hold-to-delete-progress" />
                            <div className="relative z-10 flex items-center gap-2.5 w-full">
                              <Trash2 size={16} className="shrink-0" />
                              <span className="font-semibold">
                                {isDeleteHolding === `ws-${ws.id}` ? 'Hold to confirm' : 'Delete'}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Lectures' && (
          <div>
            <h4 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-4">
              Your Recorded Lectures
            </h4>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-3xl bg-surface-hover/20">
                <h3 className="text-lg font-bold text-foreground mb-2">No lectures yet</h3>
                <p className="text-foreground-secondary text-sm text-center max-w-md">
                  Recorded lectures from your account appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {lectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="group flex items-center justify-between bg-sky-900/15 border border-brand-primary/10 rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm relative"
                  >
                    <button
                      type="button"
                      className="flex items-center gap-4 flex-1 text-left min-w-0"
                      onClick={() => onOpenLecture(lecture)}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                        <Mic size={20} className="text-brand-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                          {lecture.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-foreground-secondary font-medium">
                          <span>{lecture.date}</span>
                          <span>•</span>
                          <span>{lecture.duration}</span>
                        </div>
                      </div>
                    </button>
                    <div className="relative shrink-0">
                        <button
                          type="button"
                          className={`p-2 rounded-full transition-all duration-300 ${
                            activeMenuId === `lec-${lecture.id}`
                              ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                          }`}
                          onClick={(e) => toggleMenu(e, `lec-${lecture.id}`)}
                          aria-label="Lecture actions"
                        >
                          <MoreVertical 
                            size={20} 
                            className={activeMenuId === `lec-${lecture.id}` ? 'popover-menu-trigger-rotate' : ''} 
                          />
                        </button>
                      { (activeMenuId === `lec-${lecture.id}` || closingMenuId === `lec-${lecture.id}`) && (
                        <div
                          className={`absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl ${closingMenuId === `lec-${lecture.id}` ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                            onClick={() => onOpenLecture(lecture)}
                          >
                            <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                            Open
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                            onClick={() => openRename(lecture.id, lecture.title, 'lecture')}
                          >
                            <Edit2 size={16} className="text-zinc-500 shrink-0" />
                            Rename
                          </button>
                          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                          <button
                            type="button"
                            className={`hold-to-delete-container ${isDeleteHolding === `lec-${lecture.id}` ? 'hold-to-delete-active' : ''}`}
                            onMouseDown={() => setIsDeleteHolding(`lec-${lecture.id}`)}
                            onMouseUp={() => setIsDeleteHolding(null)}
                            onMouseLeave={() => setIsDeleteHolding(null)}
                            onTouchStart={() => setIsDeleteHolding(`lec-${lecture.id}`)}
                            onTouchEnd={() => setIsDeleteHolding(null)}
                          >
                            <div className="hold-to-delete-progress" />
                            <div className="relative z-10 flex items-center gap-2.5 w-full">
                              <Trash2 size={16} className="shrink-0" />
                              <span className="font-bold">
                                {isDeleteHolding === `lec-${lecture.id}` ? 'Hold to confirm' : 'Delete'}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Study Guides' && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                ))}
              </div>
            ) : studyGuides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 mt-2">
                <h3 className="text-2xl font-bold font-heading text-foreground mb-3 text-center">No Study Guides Yet</h3>
                <p className="text-foreground-secondary text-center max-w-md mb-8 text-sm">
                  Generate a study guide from a deck, lecture, or the create menu in the app.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {studyGuides.map((g) => (
                  <div
                    key={g.id}
                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/50 transition-all shadow-sm relative"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <BookMarked size={20} className="text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-foreground truncate">{g.title}</h3>
                        {g.topic && <p className="text-sm text-foreground-secondary truncate mt-0.5">{g.topic}</p>}
                      </div>
                    </div>
                    <div className="relative shrink-0">
                        <button
                          type="button"
                          className={`p-2 rounded-full transition-all duration-300 ${
                            activeMenuId === `sg-${g.id}`
                              ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                          }`}
                          onClick={(e) => toggleMenu(e, `sg-${g.id}`)}
                          aria-label="Study guide actions"
                        >
                          <MoreVertical 
                            size={20} 
                            className={activeMenuId === `sg-${g.id}` ? 'popover-menu-trigger-rotate' : ''} 
                          />
                        </button>
                      { (activeMenuId === `sg-${g.id}` || closingMenuId === `sg-${g.id}`) && (
                        <div
                          className={`absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl ${closingMenuId === `sg-${g.id}` ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                            onClick={() => {
                              setActiveMenuId(null)
                              window.alert('Study guide details are coming soon on web.')
                            }}
                          >
                            <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                            Open
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                            onClick={() => openRename(g.id, g.title, 'studyGuides')}
                          >
                            <Edit2 size={16} className="text-zinc-500 shrink-0" />
                            Rename
                          </button>
                          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
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
                            <div className="relative z-10 flex items-center gap-2.5 w-full">
                              <Trash2 size={16} className="shrink-0" />
                              <span className="font-semibold">
                                {isDeleteHolding === `sg-${g.id}` ? 'Hold to confirm' : 'Delete'}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      { (isRenameModalOpen || isRenameModalClosing) && (
        <div 
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60" 
          onClick={closeRenameModal}
        >
          <div
            className={`bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl ${isRenameModalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-3">Rename {renameTarget ? renameModalLabel(renameTarget.type) : 'Item'}</h3>
            <input
              className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2 text-foreground mb-4"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={closeRenameModal} className="px-4 py-2 text-foreground-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameSave}
                disabled={renameSaving}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold"
              >
                {renameSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
