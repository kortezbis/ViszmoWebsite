import { useState, useEffect } from 'react';
import {
    Upload,
    Mic,
    Layers,
    FileText,
    Podcast,
    FolderOpen,
    Sparkles,
    Flame,
    Search,
    Plus,
    Moon,
    Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { db, type DeckRow } from '../../services/database';
import { useTheme } from '../contexts/ThemeContext';
import { useDecks } from '../contexts/DecksContext';
import { CreateModal } from '../components/CreateModal';
import { SEO } from '../components/SEO';

export default function DashboardPage({ onOpenDownload = () => {}, onOpenMobileModal = () => {} }: { onOpenDownload?: () => void, onOpenMobileModal?: () => void }) {
    const navigate = useNavigate();
    const { userName, userEmail } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    const { decks, decksLoading } = useDecks();
    const [recentDecks, setRecentDecks] = useState<DeckRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [modalInitialStep, setModalInitialStep] = useState<any>(undefined);

    const first = userName?.split(/\s+/)[0] || userEmail?.split('@')[0] || 'User';

    useEffect(() => {
        if (!decksLoading) {
            setRecentDecks(decks.slice(0, 4));
            setLoading(false);
        }
    }, [decks, decksLoading]);

    const actionCards = [
        {
            title: 'Upload a file',
            description: 'Get notes or flashcards to practice with.',
            icon: Upload,
            color: 'blue',
            action: () => navigate('/dashboard/decks?tab=lectures')
        },
        {
            title: 'Live Record Class',
            description: 'Start recording and let Viszmo turn them into notes.',
            icon: Mic,
            color: 'red',
            action: () => {
                setModalInitialStep('record');
                setIsCreateModalOpen(true);
            }
        },
        {
            title: 'Flashcard Set',
            description: 'Flashcard set • Create or study terms',
            icon: Layers,
            color: 'amber',
            action: () => navigate('/dashboard/decks')
        },
        {
            title: 'Library',
            description: '',
            icon: FileText,
            color: 'indigo',
            action: () => navigate('/dashboard/decks')
        },
        {
            title: 'Download Now',
            description: 'Download the Viszmo app for your desktop to study anywhere.',
            icon: Sparkles,
            color: 'cyan',
            action: onOpenDownload
        },
        {
            title: 'Download Mobile iOS',
            description: 'Get the Viszmo mobile app to study on the go.',
            icon: Podcast,
            color: 'purple',
            action: onOpenMobileModal
        }
    ];

    return (
        <div className="w-full h-full overflow-y-auto bg-background">
            <SEO title="Dashboard" description="Your Viszmo study dashboard. Quick access to flashcards, lectures, and AI study tools." />
            {/* Header (Mirroring dashvis skeleton) */}
            <header className="h-16 flex items-center px-6 shrink-0 relative gap-2 sticky top-0 z-10">
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
                        onClick={(e) => { e.stopPropagation(); setIsCreateModalOpen(true); }}
                        className="h-11 px-6 rounded-full bg-brand-primary text-white flex items-center gap-2 hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 font-bold text-sm shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create</span>
                    </button>

                    <div className="h-11 px-4 rounded-full bg-surface-hover border border-border flex items-center gap-2 cursor-pointer hover:bg-surface-active hover:scale-105 active:scale-95 transition-all">
                        <Flame size={18} className="text-orange-500 fill-orange-500" />
                        <span className="text-base font-bold text-foreground">0</span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="h-11 w-11 rounded-full hover:bg-surface-hover text-foreground-secondary hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
                    >
                        {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">
                        Welcome, {first}
                    </h1>
                    <p className="text-foreground-secondary text-lg font-medium">
                        What would you like to study today?
                    </p>
                </div>

                {/* Action Cards Row - Horizontal Scroll as in dashvis */}
                <div>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted">Quick Actions</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-2 px-2">
                        {actionCards.map((card, idx) => (
                            <button
                                key={idx}
                                onClick={card.action}
                                className="min-w-[280px] flex-1 bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between hover:border-brand-primary/50 transition-all snap-start group shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 text-left"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand-primary transition-colors">{card.title}</h3>
                                    <p className="text-sm text-foreground-secondary leading-relaxed mb-8 font-medium">
                                        {card.description}
                                    </p>
                                </div>
                                <div
                                    className="self-start px-6 py-2.5 rounded-full bg-surface-hover border border-border text-sm font-bold text-foreground group-hover:bg-foreground group-hover:text-background transition-all active:scale-95"
                                >
                                    {card.title.includes('Download') ? card.title : 'Start'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Items / Empty State */}
                <div>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted">Recent Materials</h2>
                        {recentDecks.length > 0 && (
                            <button onClick={() => navigate('/dashboard/decks')} className="text-xs font-bold text-brand-primary hover:underline">
                                View Library
                            </button>
                        )}
                    </div>

                    {loading || decksLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 rounded-3xl bg-surface-hover animate-pulse" />
                            ))}
                        </div>
                    ) : recentDecks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 bg-surface/30 border border-dashed border-border rounded-[40px] px-6">
                            <div className="relative mb-8 scale-110">
                                <div className="w-20 h-24 bg-brand-primary rounded-2xl shadow-2xl rotate-[-10deg] absolute -left-6 -top-4 opacity-40 blur-[1px]"></div>
                                <div className="w-20 h-24 bg-surface border border-border rounded-2xl shadow-2xl relative z-10 flex items-center justify-center">
                                    <FolderOpen size={40} className="text-foreground-muted" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Start creating or explore resources</h2>
                            <p className="text-foreground-secondary max-w-sm font-medium">
                                Recent files will appear here for quick access. Start by creating your first study deck!
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/decks')}
                                className="mt-8 px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Create New
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                            {recentDecks.map((deck) => (
                                <button
                                    key={deck.id}
                                    onClick={() => navigate(`/dashboard/decks/${deck.id}`)}
                                    className="group flex flex-col bg-surface border border-border rounded-3xl p-6 hover:border-brand-primary/50 transition-all text-left shadow-sm hover:shadow-lg"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4 text-brand-primary group-hover:scale-110 transition-transform">
                                        <Layers size={24} />
                                    </div>
                                    <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary transition-colors">
                                        {deck.title}
                                    </h3>
                                    <p className="text-xs text-foreground-secondary font-bold mt-1 uppercase tracking-wider">
                                        {deck.cardCount || 0} Cards
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateModal 
                isOpen={isCreateModalOpen} 
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setModalInitialStep(undefined);
                }}
                initialStep={modalInitialStep}
            />

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
