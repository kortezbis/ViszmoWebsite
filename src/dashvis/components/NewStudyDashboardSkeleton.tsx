import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight, Home, BookOpen, User, Bell, Flame, Search, Plus, Moon, Sun, MessageSquare, Settings, LogOut, Trash2 } from 'lucide-react';
import { usePersistentTheme, DASHVIS_THEME_ROOT_ID } from '../hooks/usePersistentTheme';
import { useAuth } from '../lib/auth';
import { userInitials } from '../lib/userDisplay';
import { fetchLibrarySnapshot, type LibraryWorkspace } from '../lib/libraryData';
import type { PageId } from '../navigation';
import { createWorkspace, getFlashcardsByDeckId } from '../lib/workspaceData';

/** When set, opens the create modal at “select source” for a deck + material type (from workspace “Generate”). */
export type WorkspaceCreateIntent = {
  key: number
  type: 'flashcards' | 'lectures' | 'guides' | 'podcasts'
  deck?: { id: string; title: string; color: string; items: number }
}

export default function NewStudyDashboardSkeleton({ 
  children, 
  activePage = 'home',
  onPageChange,
  workspaceCreateIntent = null,
  onOpenCreator,
  onOpenLectureBrowser,
  onOpenPodcast,
}: { 
  children?: ReactNode;
  activePage?: PageId;
  onPageChange?: (page: PageId) => void;
  /** Open create flow (step 4) for this deck and material, e.g. from workspace header. */
  workspaceCreateIntent?: WorkspaceCreateIntent | null;
  onOpenCreator?: (source: string, dest: unknown) => void;
  onOpenLectureBrowser?: () => void;
  onOpenPodcast?: (payload: { title: string; content: string }) => void;
}) {
  const [isPodcastGenLoading, setIsPodcastGenLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isDarkMode, toggleTheme } = usePersistentTheme();
  const navigate = useNavigate();
  const { user, userEmail, userName, userImageUrl, signOut } = useAuth();
  const accountLabel = userName || userEmail || 'Account';
  const accountEmail = userEmail;
  const initials = userInitials(user, userEmail);
  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);
  const [isAccountPopoverClosing, setIsAccountPopoverClosing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateModalClosing, setIsCreateModalClosing] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1: Type, 2: Destination, 3: New Deck, 4: Source
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [, setSelectedDeck] = useState<string | null>(null);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#3B82F6');
  const [isCreating, setIsCreating] = useState(false);
  const [recentDecks, setRecentDecks] = useState<LibraryWorkspace[]>([]);

  const WORKSPACE_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'];

  const closeAccountPopover = () => {
    setIsAccountPopoverClosing(true);
    setTimeout(() => {
      setIsAccountPopoverOpen(false);
      setIsAccountPopoverClosing(false);
    }, 200);
  };

  const closeCreateModal = () => {
    setIsCreateModalClosing(true);
    setTimeout(() => {
      setIsCreateModalOpen(false);
      setIsCreateModalClosing(false);
    }, 200);
  };

  const handleSignOut = async () => {
    closeAccountPopover();
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleOpenCreate = () => {
    setSelectedType('flashcards');
    setSelectedSource(null);
    setCreateStep(4); // Start with Source Selection
    setSelectedDeck(null);
    setNewDeckTitle('');
    setIsCreateModalOpen(true);
  };

  /** Called after the user picks a deck (or creates one). Routes to the right place based on source. */
  const handleSourceAction = (deckId: string, source: string) => {
    setSelectedSource(source);
    closeCreateModal();
    
    if (source === 'lecture-browser') {
      onOpenLectureBrowser?.();
      return;
    }

    let title = newDeckTitle || 'New Deck';
    let color = newDeckColor || '#3B82F6';

    if (deckId !== 'new') {
      const existing = recentDecks.find(d => d.id === deckId);
      if (existing) {
        title = existing.title;
        color = existing.colorHex;
      } else if (workspaceCreateIntent?.deck?.id === deckId) {
        title = workspaceCreateIntent.deck.title;
        color = workspaceCreateIntent.deck.color;
      }
    }

    onOpenCreator?.(source, {
      workspaceId: deckId, // The AI needs to save to this workspace
      deckId: undefined, // Always create a new deck inside this workspace
      title,
      color,
    });
  };

  useEffect(() => {
    if (!workspaceCreateIntent) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync create modal to external workspace intent
    setIsCreateModalOpen(true);
    setSelectedType(workspaceCreateIntent.type);
    if (workspaceCreateIntent.deck) {
      setSelectedDeck(workspaceCreateIntent.deck.id);
      setCreateStep(4);
    } else {
      setCreateStep(2);
    }
    // Only fire when a new request is sent (key), not when other fields are edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceCreateIntent?.key]);

  const navigateTo = (page: PageId) => {
    setMobileSidebarOpen(false);
    onPageChange?.(page);
  };

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim() || !user?.id) return;
    setIsCreating(true);
    try {
      await createWorkspace(user.id, newDeckTitle.trim(), newDeckColor);
      closeCreateModal();
      navigateTo('library');
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (isCreateModalOpen && user?.id) {
      const loadRecent = async () => {
        try {
          const data = await fetchLibrarySnapshot(user.id);
          setRecentDecks(data.workspaces.slice(0, 5));
        } catch (e) {
          console.error('Failed to load recent decks', e);
        }
      };
      void loadRecent();
    }
  }, [isCreateModalOpen, user?.id]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setMobileSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (activePage === 'chat') {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [activePage]);

  return (
    <div className="min-h-[100dvh] bg-background flex text-foreground font-sans w-full min-w-0 transition-colors duration-300">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center gap-2 border-b border-border bg-background/95 pl-3 pr-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-surface-hover text-foreground-secondary shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="font-semibold text-foreground truncate">Viszmo</span>
      </div>

      {mobileSidebarOpen ? (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          aria-label="Close menu"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 bg-surface border-r border-border ease-in-out flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-64 md:w-20' : 'w-64'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className={`h-16 flex items-center justify-between ${isSidebarCollapsed ? 'px-0' : 'px-4'} shrink-0`}>
          {!isSidebarCollapsed ? (
            <img 
              src="/logos/fullViszmologo.png" 
              alt="Viszmo" 
              className="h-8 object-contain" 
              style={!isDarkMode ? { filter: 'brightness(0)' } : {}}
            />
          ) : (
            <img 
              src="/logos/viszmo.png" 
              alt="Viszmo" 
              className="h-16 w-16 object-contain mx-auto scale-150" 
              style={!isDarkMode ? { filter: 'brightness(0)' } : {}}
            />
          )}
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-secondary transition-colors"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {isSidebarCollapsed && (
          <div className="flex justify-center mt-4 mb-2">
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 rounded-lg hover:bg-surface-hover text-foreground-secondary transition-colors"
              aria-label="Expand Sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        <nav className="flex-1 py-4 flex flex-col gap-2 px-3 mt-2 overflow-y-auto min-h-0">
          <button 
            onClick={() => navigateTo('home')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] ${
              activePage === 'home' 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <Home size={20} className="group-hover:scale-110 transition-transform duration-300 shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium">Home</span>}
          </button>

          <button 
            onClick={() => navigateTo('library')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] ${
              activePage === 'library' 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <BookOpen size={20} className="group-hover:scale-110 transition-transform duration-300 shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium">Library</span>}
          </button>

          <button 
            onClick={() => navigateTo('chat')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] ${
              activePage === 'chat' 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <MessageSquare size={20} className="group-hover:scale-110 transition-transform duration-300 shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium">Chat</span>}
          </button>

          <div className="my-2 border-t border-border mx-1 shrink-0" />

          <button 
            onClick={() => navigateTo('trash')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] ${
              activePage === 'trash' 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <Trash2 size={20} className="group-hover:scale-110 transition-transform duration-300 shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium">Trash</span>}
          </button>
        </nav>

        <div className="p-3 border-t border-border flex flex-col gap-1">
          {!isSidebarCollapsed && (
            <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-hover text-foreground-secondary hover:text-foreground transition-colors relative group" aria-label="Notifications">
              <div className="relative">
                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-surface"></span>
              </div>
              <span className="text-sm font-medium">Notifications</span>
            </button>
          )}

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (isAccountPopoverOpen) {
                closeAccountPopover();
              } else {
                setIsAccountPopoverOpen(true);
              }
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 group ${isAccountPopoverOpen ? 'popover-menu-trigger-on' : 'hover:bg-surface-hover/50'}`}
          >
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-border group-hover:border-brand-primary/50 transition-colors shadow-sm shrink-0 overflow-hidden">
              {userImageUrl ? (
                <img src={userImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-brand-primary">{initials}</span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 text-left animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
                <div className="text-sm font-bold text-foreground truncate">{accountLabel}</div>
                {accountEmail && (
                  <div className="text-[10px] text-foreground-secondary font-medium truncate">{accountEmail}</div>
                )}
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 h-[100dvh] max-h-[100dvh] overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-0 animate-in fade-in slide-in-from-right duration-500">
        {/* Top Header */}
        {(activePage !== 'workspace' && activePage !== 'lecture' && activePage !== 'deckDetails' && activePage !== 'cardEditor' && activePage !== 'chat' && activePage !== 'podcastPlayer') && (
          <header className="h-16 flex items-center px-3 sm:px-6 shrink-0 relative gap-2 bg-surface border-b border-border">
           <div className="flex-1 hidden md:block"></div>

           {/* Centered Search Bar */}
           <div className="flex-1 md:flex-none w-full max-w-xl md:absolute md:left-1/2 md:-translate-x-1/2">
               <div className="relative flex items-center w-full h-11 rounded-2xl bg-surface border border-border px-4 focus-within:border-brand-primary focus-within:shadow-sm transition-all">
                 <Search size={18} className="text-foreground-secondary mr-2 shrink-0" />
                 <input 
                   type="text" 
                   placeholder="Search for anything" 
                   className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-foreground-muted"
                 />
               </div>
             </div>
           
           {/* Header Actions */}
           <div className="flex-1 flex justify-end items-center gap-3 shrink-0 ml-4 md:ml-0">
             <button 
               onClick={handleOpenCreate}
               className="h-11 px-4 sm:px-6 rounded-full bg-brand-primary text-white flex items-center gap-2 hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 font-bold text-sm shrink-0" 
               aria-label="Create"
             >
               <Plus size={18} />
               <span className="hidden sm:inline">Create</span>
             </button>

             {/* Pill-shaped Streak Button */}
             <div className="h-11 px-4 rounded-full bg-surface-hover border border-border flex items-center gap-2 cursor-pointer hover:bg-surface-active hover:scale-105 active:scale-95 transition-all">
                 <Flame size={18} className="text-orange-500 fill-orange-500" />
                 <span className="text-base font-bold text-foreground">0</span>
               </div>

             <button 
               onClick={toggleTheme}
               className="h-11 w-11 rounded-full hover:bg-surface-hover text-foreground-secondary hover:scale-110 active:scale-90 transition-all flex items-center justify-center" 
               aria-label="Toggle Theme"
             >
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
           </div>
          </header>
        )}

        <div className={`flex-1 overflow-auto min-w-0 ${(activePage === 'chat' || activePage === 'workspace' || activePage === 'library' || activePage === 'deckDetails' || activePage === 'cardEditor' || activePage === 'lecture' || activePage === 'podcastPlayer' || activePage === 'trash') ? 'p-0' : 'p-3 sm:p-6'}`}>
          <div className={`min-w-0 ${(activePage === 'chat' || activePage === 'workspace' || activePage === 'library' || activePage === 'deckDetails' || activePage === 'cardEditor' || activePage === 'lecture' || activePage === 'podcastPlayer' || activePage === 'trash') ? 'w-full h-full' : 'max-w-6xl mx-auto space-y-6'}`}>
            {children}
          </div>
        </div>
      </main>

      { (isCreateModalOpen || isCreateModalClosing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isCreateModalClosing ? 'opacity-0' : 'animate-in fade-in duration-500'}`} 
            onClick={closeCreateModal}
          />
          
          {/* Modal Content */}
          <div className={`relative w-full max-w-5xl popover-menu-surface shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] overflow-hidden flex h-[min(680px,90dvh)] min-h-0 max-h-[90dvh] ${isCreateModalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}>
            
            {/* Left Sidebar Navigation */}
            <div className="w-64 bg-surface-hover/30 border-r border-border flex flex-col p-4 shrink-0">
                <div className="mb-6">
                  <span className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] px-4">Organize</span>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => {
                        setSelectedType('deck');
                        setCreateStep(3); // Go straight to New Deck creation
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-bold text-[15px] ${
                        selectedType === 'deck' 
                          ? 'bg-brand-primary/10 text-brand-primary' 
                          : 'text-foreground-secondary hover:bg-surface-hover/50 hover:text-foreground'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center p-1.5 shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                        <Plus size={18} />
                      </div>
                      <span className="flex-1 text-left">New Deck</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] px-4">Create & Study</span>
                  <div className="mt-2 space-y-1">
                    {[
                      { id: 'flashcards', label: 'Flashcard set', icon: '/logos/branding/Deck.png' },
                      { id: 'lectures', label: 'Lecture notes', icon: '/logos/branding/voice.png', pro: true },
                      { id: 'guides', label: 'Study Guide', icon: '/logos/branding/guide.png' },
                      { id: 'podcasts', label: 'Podcast', icon: '/logos/branding/podcast.png', pro: true },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedType(cat.id);
                          setCreateStep(4); // Switch type but stay on source selection
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-bold text-[15px] ${
                          selectedType === cat.id 
                            ? 'bg-brand-primary/10 text-brand-primary' 
                            : 'text-foreground-secondary hover:bg-surface-hover/50 hover:text-foreground'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center p-1.5 shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                          <img src={cat.icon} alt="" className="w-full h-full object-contain" />
                        </div>
                        <span className="flex-1 text-left">{cat.label}</span>
                        {cat.pro && <span className="text-[9px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-md font-black tracking-wider">PRO</span>}
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent">
              {/* Header */}
              <div className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  {createStep !== 4 && (
                    <button 
                      onClick={() => {
                        if (createStep === 2 || createStep === 3) {
                          setCreateStep(4);
                        } else {
                          setCreateStep(createStep - 1);
                        }
                      }}
                      className="w-8 h-8 rounded-full hover:bg-surface-hover flex items-center justify-center text-foreground-secondary transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-foreground capitalize">
                      {!selectedType ? "Choose what to create" : 
                       createStep === 2 ? `Add to Deck (${selectedType})` :
                       createStep === 3 ? "Create New Deck" :
                       `Select Source for ${selectedType}`}
                    </h2>
                    <p className="text-base text-foreground-secondary mt-1">
                      {createStep === 2 ? "Select where you want to save this" :
                       createStep === 3 ? "Give your deck a name and color" :
                       "Choose how you want to build this set"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-hover flex items-center justify-center text-foreground-secondary transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-8">
                {/* Step 1: Default Empty State (if no type selected yet) */}
                {!selectedType && createStep === 1 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-surface-hover flex items-center justify-center text-foreground-muted">
                      <Plus size={40} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Select a category</h3>
                      <p className="text-sm text-foreground-secondary">Choose a material type from the sidebar to begin.</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Select Destination */}
                {createStep === 2 && (
                  <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button 
                      onClick={() => setCreateStep(3)}
                      className="flex items-center gap-4 p-5 rounded-3xl bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 hover:bg-brand-primary/20 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                        <Plus size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">Create New Deck</h3>
                        <p className="text-xs text-foreground-secondary leading-relaxed">Organize this new set in a fresh container</p>
                      </div>
                      <ChevronRight size={20} className="text-foreground-muted group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="space-y-2 mt-2">
                      <span className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] px-1">Recent Decks</span>
                      {recentDecks.length === 0 ? (
                        <p className="text-sm text-foreground-secondary px-1 py-3 rounded-2xl border border-dashed border-border bg-surface-hover/20 text-center">
                          No decks yet. Create a new deck above.
                        </p>
                      ) : (
                        recentDecks.map((deck) => (
                        <button
                          key={deck.id}
                          onClick={() => {
                            setSelectedDeck(deck.id);
                            handleSourceAction(deck.id, selectedSource || 'text');
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-hover/30 border border-border hover:border-brand-primary/40 hover:bg-surface-hover/50 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl shadow-inner border border-black/5" style={{ backgroundColor: deck.colorHex }}></div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-sm">{deck.title}</h3>
                            <p className="text-xs text-foreground-secondary">{deck.stats.cardCount} items</p>
                          </div>
                          <ChevronRight size={18} className="text-foreground-muted group-hover:translate-x-1 transition-transform" />
                        </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Create New Deck */}
                {createStep === 3 && (
                  <div className="flex flex-col gap-8 mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-foreground-muted uppercase tracking-[0.2em]">Deck Name</label>
                      <input 
                        type="text"
                        placeholder="My New Deck..."
                        className="w-full bg-transparent border-b-2 border-border py-6 text-4xl font-bold text-foreground outline-none focus:border-brand-primary transition-colors placeholder:text-foreground-muted"
                        value={newDeckTitle}
                        onChange={(e) => setNewDeckTitle(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Select Appearance</label>
                      <div className="grid grid-cols-4 gap-4">
                        {WORKSPACE_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewDeckColor(color)}
                            className={`h-14 rounded-2xl transition-all relative ${newDeckColor === color ? 'ring-4 ring-brand-primary/30 border-4 border-surface scale-105 shadow-xl' : 'hover:scale-105 border-4 border-transparent'}`}
                            style={{ backgroundColor: color }}
                          >
                            {newDeckColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center text-white">
                                <Plus size={20} className="opacity-80" />
                              </div>
                            )}
                          </button>
                        ))}
                        
                        {/* Custom Color Option */}
                        <div className="relative">
                          <input 
                            type="color"
                            id="customColor"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => setNewDeckColor(e.target.value)}
                          />
                          <label 
                            htmlFor="customColor"
                            className={`flex flex-col items-center justify-center h-14 rounded-2xl border-2 border-dashed border-border hover:border-brand-primary/50 hover:bg-surface-hover transition-all cursor-pointer relative overflow-hidden ${!WORKSPACE_COLORS.includes(newDeckColor) ? 'ring-4 ring-brand-primary/30 border-4 border-surface scale-105 shadow-xl' : ''}`}
                            style={{ backgroundColor: !WORKSPACE_COLORS.includes(newDeckColor) ? newDeckColor : 'transparent' }}
                          >
                            {!WORKSPACE_COLORS.includes(newDeckColor) ? (
                              <div className="absolute inset-0 flex items-center justify-center text-white">
                                <Plus size={20} className="opacity-80 shadow-sm" />
                              </div>
                            ) : (
                              <>
                                <Plus size={20} className="text-foreground-secondary" />
                                <span className="text-[8px] font-black uppercase text-foreground-muted">Custom</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={!newDeckTitle.trim() || isCreating}
                      onClick={() => {
                        if (selectedType === 'deck') {
                          void handleCreateDeck();
                        } else {
                          // Create the deck first, then trigger the source action
                          setIsCreating(true);
                          void (async () => {
                            try {
                              let targetId = 'new';
                              if (user?.id && newDeckTitle.trim()) {
                                const ws = await createWorkspace(user.id, newDeckTitle.trim(), newDeckColor);
                                targetId = ws.id;
                              }
                              handleSourceAction(targetId, selectedSource || 'text');
                            } catch (e) {
                              window.alert(e instanceof Error ? e.message : 'Create failed');
                            } finally {
                              setIsCreating(false);
                            }
                          })();
                        }
                      }}
                      className="w-full py-5 rounded-2xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-brand-primary/20 text-lg"
                    >
                      {isCreating ? "Creating..." : selectedType === 'deck' ? "Create Deck" : "Create & Continue"}
                    </button>
                  </div>
                )}

                {/* Step 4: Select Source */}
                {createStep === 4 && (
                  <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    {selectedType === 'flashcards' && (
                      <>
                        {/* Row 1 */}
                        <button 
                          onClick={() => { setSelectedSource('upload'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-brand-primary/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/upload.png.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-[15px]">Upload</h3>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">PDFs, PPTs, or Notes</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setSelectedSource('record'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-red-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/voice.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-foreground text-[15px]">Record</h3>
                              <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1 py-0.5 rounded font-black tracking-tighter">NEW</span>
                            </div>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Live audio lecture</p>
                          </div>
                        </button>

                        {/* Row 2 */}
                        <button 
                          onClick={() => { setSelectedSource('import'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-green-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/inbox.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-foreground text-[15px]">Import</h3>
                              <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1 py-0.5 rounded font-black tracking-tighter">NEW</span>
                            </div>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Import from files</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setSelectedSource('text'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-blue-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/vocab.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-[15px]">Text</h3>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Paste or type notes</p>
                          </div>
                        </button>

                        {/* Row 3 */}
                        <button 
                          onClick={() => { setSelectedSource('subject'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-orange-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/book.png.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-[15px]">Subject</h3>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Topic from scratch</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setSelectedSource('link'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-purple-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/link.png.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-[15px]">Link</h3>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Article or website</p>
                          </div>
                        </button>

                        {/* Row 4 */}
                        <button 
                          onClick={() => { setSelectedSource('youtube'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-red-600/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/youtube.png.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-[15px]">YouTube Link</h3>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Video to flashcards</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setSelectedSource('anki'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-indigo-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/favorite.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-foreground text-[15px]">Anki</h3>
                              <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1 py-0.5 rounded font-black tracking-tighter">NEW</span>
                            </div>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Import Anki decks</p>
                          </div>
                        </button>

                        {/* Row 5 */}
                        <button 
                          onClick={() => { setSelectedSource('quizlet'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-[#4255ff]/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-2 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/quizlet.png.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-[15px]">Quizlet Set</h3>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Import from Quizlet</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setSelectedSource('manual'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-zinc-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/manual.png.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-[15px]">Manual</h3>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Create cards manually</p>
                          </div>
                        </button>
                      </>
                    )}
                    {selectedType === 'lectures' && (
                      <>
                        <button 
                          onClick={() => { setSelectedSource('lecture-overlay'); setCreateStep(2); }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-red-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/voice.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-foreground text-[15px]">Overlay</h3>
                              <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1 py-0.5 rounded font-black tracking-tighter">PRO</span>
                            </div>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Floating mini recorder</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedSource('lecture-browser');
                            setIsCreateModalOpen(false);
                            onOpenLectureBrowser?.();
                          }}
                          className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface-hover/20 border border-border hover:border-blue-500/40 hover:bg-surface-hover/40 transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            <img src="/logos/branding/web-browser.png" alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-foreground text-[15px]">Browser</h3>
                              <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1 py-0.5 rounded font-black tracking-tighter">PRO</span>
                            </div>
                            <p className="text-xs text-foreground-secondary leading-tight mt-0.5">Record in your browser</p>
                          </div>
                        </button>
                      </>
                    )}
                    {selectedType === 'podcasts' && (
                      <div className="col-span-2 flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                          <img src="/logos/branding/podcast.png" alt="" className="w-10 h-10 object-contain" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Ready to listen?</h3>
                        <p className="text-sm text-foreground-secondary mb-8 max-w-xs">
                          Viszmo will use the content from &quot;{workspaceCreateIntent?.deck?.title ?? 'your deck'}&quot; to generate your podcast episode.
                        </p>
                        <button 
                          type="button"
                          disabled={!workspaceCreateIntent?.deck || isPodcastGenLoading}
                          onClick={async () => {
                            const deck = workspaceCreateIntent?.deck;
                            if (!deck || !onOpenPodcast) return;
                            setIsPodcastGenLoading(true);
                            try {
                              const cards = await getFlashcardsByDeckId(deck.id);
                              const content = cards.length > 0 
                                ? cards.map(c => `Term: ${c.front}\nDefinition: ${c.back}`).join('\n\n')
                                : `Material from deck: ${deck.title}.`;
                              setIsCreateModalOpen(false);
                              onOpenPodcast({ title: deck.title, content, workspaceId: deck.id });
                            } catch {
                              setIsCreateModalOpen(false);
                              onOpenPodcast({ title: deck.title, content: `Material: ${deck.title}`, workspaceId: deck.id });
                            } finally {
                              setIsPodcastGenLoading(false);
                            }
                          }}
                          className="px-8 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPodcastGenLoading ? 'Generating…' : 'Generate Podcast Now'}
                        </button>
                      </div>
                    )}
                    {/* Placeholder for others */}
                    {(selectedType !== 'flashcards' && selectedType !== 'lectures' && selectedType !== 'podcasts') && (
                      <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-surface-hover flex items-center justify-center text-foreground-muted shadow-inner">
                          <Plus size={48} className="opacity-20" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Coming Soon</h3>
                          <p className="text-sm text-foreground-secondary mt-2 max-w-xs mx-auto">This creation method is being optimized for the desktop dashboard.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Account popover: portal inside #viszmo-dashboard-v2-root when present so `dark:` + CSS variables apply; else body + local .dark */}
      {typeof document !== 'undefined' &&
        (isAccountPopoverOpen || isAccountPopoverClosing) &&
        createPortal(
          <>
            <div
              className={`fixed inset-0 z-[110] bg-transparent ${isAccountPopoverClosing ? 'pointer-events-none' : ''}`}
              onClick={closeAccountPopover}
              aria-hidden
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className={`fixed z-[120] ${isAccountPopoverClosing ? 'popover-menu-account-closing' : 'popover-menu-account-animate'} ${!document.getElementById(DASHVIS_THEME_ROOT_ID) && isDarkMode ? 'dark' : ''}`}
              style={{
                left: isSidebarCollapsed ? 92 : 268,
                bottom: 24,
                width: 288,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              role="dialog"
              aria-label="Account menu"
            >
              <div className="popover-menu-surface flex flex-col p-1.5 text-left">
                {/* Header */}
                <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1.5 mx-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shadow-sm overflow-hidden shrink-0">
                      {userImageUrl ? (
                        <img src={userImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{accountLabel}</div>
                      <div className="text-xs text-foreground-secondary font-medium truncate">
                        {accountEmail || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-1.5 flex flex-col">
                  <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left">
                    <User className="w-4 h-4 text-zinc-500 shrink-0" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-sm font-medium text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDarkMode ? <Sun className="w-4 h-4 text-zinc-500 shrink-0" /> : <Moon className="w-4 h-4 text-zinc-500 shrink-0" />}
                      {isDarkMode ? 'Enable Light Mode' : 'Enable Dark Mode'}
                    </div>
                    <div className="w-8 h-4 bg-zinc-300/60 dark:bg-white/10 rounded-full relative flex items-center px-0.5">
                      <div
                        className={`w-3 h-3 rounded-full bg-foreground transition-all ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </div>
                  </button>
                  <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left">
                    <Settings className="w-4 h-4 text-zinc-500 shrink-0" />
                    Settings
                  </button>
                </div>

                {/* Footer */}
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1"></div>
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-sm font-medium text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.getElementById(DASHVIS_THEME_ROOT_ID) ?? document.body
        )}
    </div>
  );
}

