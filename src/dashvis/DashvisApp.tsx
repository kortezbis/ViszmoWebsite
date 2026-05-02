import { useState } from 'react'
import NewStudyDashboardSkeleton, { type WorkspaceCreateIntent } from './components/NewStudyDashboardSkeleton'
import LibraryPage, { type LibraryOpenLecture, type LibraryOpenWorkspace } from './components/LibraryPage'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'
import TrashPage from './components/TrashPage'
import WorkspacePage from './components/WorkspacePage'
import LecturePage from './components/LecturePage'
import DeckDetailsPage, { type DeckDetailsTarget } from './components/DeckDetailsPage'
import StudyAllPage, { type StudyAllTarget } from './components/StudyAllPage'
import CardEditorPage from './components/CardEditorPage'
import FlashcardCreatorPage, { type CreatorSource, type CreatorDest } from './components/FlashcardCreatorPage'
import PodcastPlayerPage from './components/PodcastPlayerPage'
import type { PageId } from './navigation'
import type { WsFlashcard } from './lib/workspaceData'

/** Main shell from the dashvis project (state-based navigation inside /dashboard). */
export default function DashvisApp() {
  const [activePage, setActivePage] = useState<PageId>('home')
  /** Root workspace first, then each drilled sub-workspace. */
  const [workspaceStack, setWorkspaceStack] = useState<LibraryOpenWorkspace[]>([])
  const [lectureTarget, setLectureTarget] = useState<LibraryOpenLecture | null>(null)
  const [lectureBackPage, setLectureBackPage] = useState<PageId>('library')
  const [deckDetailsTarget, setDeckDetailsTarget] = useState<DeckDetailsTarget | null>(null)
  const [studyAllTarget, setStudyAllTarget] = useState<StudyAllTarget | null>(null)
  const [workspaceCreateIntent, setWorkspaceCreateIntent] = useState<WorkspaceCreateIntent | null>(null)
  const [cardEditorState, setCardEditorState] = useState<{
    title: string
    cards: WsFlashcard[]
    orderStorageKey: string
    initialCardId?: string
  } | null>(null)
  const [creatorState, setCreatorState] = useState<{
    source: CreatorSource
    dest: CreatorDest
  } | null>(null)
  const [podcastState, setPodcastState] = useState<{
    title: string
    content: string
    workspaceId?: string
    savedId?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialScript?: any
  } | null>(null)

  const handlePageChange = (page: PageId) => {
    // Keep workspaceStack when drilling into sub-pages from a workspace
    if (
      page !== 'workspace' &&
      page !== 'deckDetails' &&
      page !== 'studyAll' &&
      page !== 'cardEditor' &&
      page !== 'flashcardCreator' &&
      page !== 'podcastPlayer' &&
      page !== 'lecture'
    ) {
      setWorkspaceStack([])
    }
    if (page !== 'lecture') setLectureTarget(null)
    // Keep deck details target when opening card editor, lecture, or podcast from deck view.
    const deckDetailsFlow: PageId[] = ['deckDetails', 'studyAll', 'cardEditor', 'lecture', 'podcastPlayer']
    if (!deckDetailsFlow.includes(page)) {
      setDeckDetailsTarget(null)
    }
    if (page !== 'studyAll') setStudyAllTarget(null)
    if (page !== 'cardEditor') setCardEditorState(null)
    if (page !== 'flashcardCreator') setCreatorState(null)
    if (page !== 'podcastPlayer') setPodcastState(null)
    setActivePage(page)
  }

  const openLecture = (lecture: LibraryOpenLecture, backPage: PageId) => {
    setLectureTarget(lecture)
    setLectureBackPage(backPage)
    handlePageChange('lecture')
  }

  const openLectureBrowser = () => {
    openLecture(
      {
        id: 'browser-recording',
        title: 'New Browser Recording',
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        duration: '0:00',
      },
      'library'
    )
  }

  const openCreator = (source: string, dest: unknown) => {
    setCreatorState({ source: source as CreatorSource, dest: dest as CreatorDest })
    handlePageChange('flashcardCreator')
  }

  return (
    <NewStudyDashboardSkeleton
      activePage={activePage}
      onPageChange={handlePageChange}
      workspaceCreateIntent={workspaceCreateIntent}
      onOpenCreator={openCreator}
      onOpenLectureBrowser={openLectureBrowser}
      onOpenPodcast={(payload) => {
        setPodcastState(payload)
        handlePageChange('podcastPlayer')
      }}
    >
      {activePage === 'library' && (
        <LibraryPage
          onOpenWorkspace={(w) => {
            setWorkspaceStack([w])
            handlePageChange('workspace')
          }}
          onOpenLecture={(l) => openLecture(l, 'library')}
        />
      )}
      {activePage === 'home' && (
        <HomePage
          onOpenCreate={(type) => {
            setWorkspaceCreateIntent({
              key: Date.now(),
              type,
            })
          }}
        />
      )}
      {activePage === 'chat' && <ChatPage onPageChange={handlePageChange} />}
      {activePage === 'trash' && <TrashPage />}
      {activePage === 'workspace' && workspaceStack.length > 0 && (
        <WorkspacePage
          workspace={workspaceStack[workspaceStack.length - 1]!}
          stackDepth={workspaceStack.length}
          onPageChange={handlePageChange}
          onOpenSubWorkspace={(child) => setWorkspaceStack((s) => [...s, child])}
          onBackInStack={() => setWorkspaceStack((s) => s.slice(0, -1))}
          onOpenLecture={(l) => {
            openLecture(l, 'workspace')
          }}
          onOpenDeckDetails={(t) => {
            setDeckDetailsTarget(t)
            handlePageChange('deckDetails')
          }}
          onOpenStudyAll={(t) => {
            setStudyAllTarget(t)
            handlePageChange('studyAll')
          }}
          onOpenCardEditor={(payload) => {
            setCardEditorState(payload)
            handlePageChange('cardEditor')
          }}
          onOpenPodcast={(payload) => {
            setPodcastState(payload)
            handlePageChange('podcastPlayer')
          }}
          onOpenCreateMaterial={(type, info) => {
            const w = workspaceStack[workspaceStack.length - 1]
            if (!w) return
            setWorkspaceCreateIntent({
              key: Date.now(),
              type,
              deck: {
                id: w.id,
                title: w.title,
                color: w.colorHex,
                items: info.cardCount,
              },
            })
          }}
        />
      )}
      {activePage === 'deckDetails' && deckDetailsTarget && (
        <DeckDetailsPage
          target={deckDetailsTarget}
          onOpenCardEditor={(payload) => {
            setCardEditorState(payload)
            handlePageChange('cardEditor')
          }}
          onOpenLecture={(l) => openLecture(l, 'deckDetails')}
          onOpenCreateMaterial={(type, info) => {
            setWorkspaceCreateIntent({
              key: Date.now(),
              type,
              deck: {
                id: deckDetailsTarget.workspaceId,
                title: info.title,
                color: info.color,
                items: info.cardCount,
              },
            })
          }}
          onOpenPodcast={(payload) => {
            setPodcastState(payload)
            handlePageChange('podcastPlayer')
          }}
          onBack={() => {
            setDeckDetailsTarget(null)
            handlePageChange('workspace')
          }}
        />
      )}
      {activePage === 'studyAll' && studyAllTarget && (
        <StudyAllPage
          target={studyAllTarget}
          onBack={() => {
            setStudyAllTarget(null)
            handlePageChange('workspace')
          }}
        />
      )}
      {activePage === 'cardEditor' && cardEditorState && (
        <CardEditorPage
          title={cardEditorState.title}
          cards={cardEditorState.cards}
          orderStorageKey={cardEditorState.orderStorageKey}
          initialCardId={cardEditorState.initialCardId}
          onBack={() => handlePageChange('deckDetails')}
        />
      )}
      {activePage === 'lecture' && lectureTarget && (
        <LecturePage
          key={lectureTarget.id}
          lecture={lectureTarget}
          onBack={() => {
            handlePageChange(lectureBackPage)
          }}
        />
      )}
      {activePage === 'flashcardCreator' && creatorState && (
        <FlashcardCreatorPage
          source={creatorState.source}
          dest={creatorState.dest}
          onDone={() => {
            setCreatorState(null)
            if (workspaceStack.length > 0) {
              handlePageChange('workspace')
            } else {
              handlePageChange('library')
            }
          }}
          onBack={() => {
            setCreatorState(null)
            if (workspaceStack.length > 0) {
              handlePageChange('workspace')
            } else {
              handlePageChange('library')
            }
          }}
        />
      )}
      {activePage === 'podcastPlayer' && podcastState && (
        <PodcastPlayerPage
          title={podcastState.title}
          content={podcastState.content}
          workspaceId={podcastState.workspaceId}
          initialScript={podcastState.initialScript}
          onBack={() => handlePageChange('workspace')}
        />
      )}
    </NewStudyDashboardSkeleton>
  )
}
