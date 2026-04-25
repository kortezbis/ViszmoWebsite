import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    BrainCircuit,
    ClipboardCheck,
    FolderInput,
    Layers,
    Loader2,
    Mic,
    MoreHorizontal,
    PenTool,
    Puzzle,
    Share2,
    Sparkles,
    Zap,
} from 'lucide-react';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { useDecks, getDeckCardCount } from '../contexts/DecksContext';
import { db, type FlashcardRow, type WorkspaceRow } from '../../services/database';

type ContentTab = 'cards' | 'notes' | 'imports';

/** Hub when opening a deck: study modes + tabs + sub-workspaces (iOS workspace nesting). Gizmo-style layout, Viszmo styling. */
const STUDY_MODES: {
    label: string;
    path: string;
    icon: typeof Layers;
    description: string;
}[] = [
    {
        label: 'Flashcards',
        path: '/dashboard/flashcards',
        icon: Layers,
        description: 'Flip through terms',
    },
    {
        label: 'Learn',
        path: '/dashboard/learn',
        icon: BrainCircuit,
        description: 'Adaptive course',
    },
    {
        label: 'Rapid Fire',
        path: '/dashboard/quiz',
        icon: Zap,
        description: 'Quick recall',
    },
    {
        label: 'Matching',
        path: '/dashboard/match',
        icon: Puzzle,
        description: 'Match pairs',
    },
    {
        label: 'Written',
        path: '/dashboard/written',
        icon: PenTool,
        description: 'Type answers',
    },
    {
        label: 'Speaking',
        path: '/dashboard/speaking',
        icon: Mic,
        description: 'Speak answers',
    },
    {
        label: 'Practice Test',
        path: '/dashboard/test',
        icon: ClipboardCheck,
        description: 'Exam style',
    },
];

export default function DeckDetailPage() {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const { getDeckById, setActiveDeck, refreshDecks, exportDeck, decksLoading } = useDecks();

    const [cards, setCards] = useState<FlashcardRow[]>([]);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [subWorkspaces, setSubWorkspaces] = useState<WorkspaceRow[]>([]);
    const [subLoading, setSubLoading] = useState(false);
    const [tab, setTab] = useState<ContentTab>('cards');

    const deck = deckId ? getDeckById(deckId) : undefined;

    useEffect(() => {
        if (!deckId) return;
        setActiveDeck(deckId);
    }, [deckId, setActiveDeck]);

    useEffect(() => {
        void refreshDecks();
    }, [deckId, refreshDecks]);

    const loadCards = useCallback(async () => {
        if (!deckId) return;
        setCardsLoading(true);
        try {
            const rows = await db.getFlashcardsByDeckId(deckId);
            setCards(rows);
        } finally {
            setCardsLoading(false);
        }
    }, [deckId]);

    useEffect(() => {
        void loadCards();
    }, [loadCards]);

    useEffect(() => {
        if (!deck?.workspaceId) {
            setSubWorkspaces([]);
            return;
        }
        let cancelled = false;
        setSubLoading(true);
        void db.getSubWorkspaces(deck.workspaceId).then((rows) => {
            if (!cancelled) setSubWorkspaces(rows);
            if (!cancelled) setSubLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [deck?.workspaceId]);

    const deckQuery = deckId ? `?deckId=${encodeURIComponent(deckId)}` : '';

    const handleShare = () => {
        if (!deckId) return;
        const json = exportDeck(deckId);
        if (json) void navigator.clipboard.writeText(json);
    };

    if (!deckId) {
        return null;
    }

    if (!deck && decksLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-foreground-secondary text-sm">Loading deck…</p>
                <Link to="/dashboard/decks" className="text-brand-primary font-semibold text-sm">
                    Back to library
                </Link>
            </div>
        );
    }

    if (!deck) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
                <p className="text-foreground-secondary text-sm">Deck not found.</p>
                <Link to="/dashboard/decks" className="text-brand-primary font-semibold text-sm">
                    Back to library
                </Link>
            </div>
        );
    }

    const nCards = getDeckCardCount(deck);

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <Link
                            to="/dashboard/decks"
                            className="text-sm font-medium text-foreground-muted hover:text-brand-primary"
                        >
                            Library
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex items-start gap-4 min-w-0">
                            <div
                                className="w-14 h-14 rounded-2xl shrink-0 bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center"
                                aria-hidden
                            >
                                <BookOpen className="w-7 h-7 text-brand-primary" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                                    {deck.title}
                                </h1>
                                <p className="text-foreground-secondary text-sm mt-1">
                                    {nCards} {nCards === 1 ? 'card' : 'cards'}
                                    {deck.workspaceId ? (
                                        <span className="text-foreground-muted">
                                            {' '}
                                            · In a workspace — nested folders below
                                        </span>
                                    ) : null}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background-elevated text-sm font-semibold hover:bg-surface-hover"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            <Link
                                to={`/dashboard/edit-deck/${deckId}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background-elevated text-sm font-semibold hover:bg-surface-hover"
                            >
                                Edit cards
                            </Link>
                            <Link
                                to={`/dashboard/flashcards${deckQuery}`}
                                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25"
                            >
                                <Sparkles className="w-4 h-4" />
                                Study deck
                            </Link>
                        </div>
                    </div>

                    {/* Study modes — primary hub (replaces hunting modes only in the sidebar) */}
                    <div className="rounded-2xl border border-border bg-background-elevated p-4">
                        <h2 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">
                            Study modes
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {STUDY_MODES.map((m) => (
                                <Link
                                    key={m.path}
                                    to={`${m.path}${deckQuery}`}
                                    className="flex items-start gap-3 p-3 rounded-xl border border-border/80 bg-surface hover:border-brand-primary/40 hover:bg-surface-hover transition-colors group"
                                >
                                    <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/20">
                                        <m.icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-foreground leading-tight">
                                            {m.label}
                                        </div>
                                        <div className="text-[11px] text-foreground-muted mt-0.5 leading-snug">
                                            {m.description}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-10">
                <FadeInUp>
                    {/* Sub-decks: child workspaces under this deck’s workspace (same model as iOS). */}
                    {deck.workspaceId ? (
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-bold text-foreground">
                                    Sub-decks
                                    <span className="text-foreground-muted font-normal text-sm ml-2">
                                        ({subWorkspaces.length})
                                    </span>
                                </h2>
                                {subLoading && <Loader2 className="w-4 h-4 animate-spin text-foreground-muted" />}
                            </div>
                            {subWorkspaces.length === 0 && !subLoading ? (
                                <p className="text-sm text-foreground-secondary py-4 rounded-2xl border border-dashed border-border px-4">
                                    No nested folders here yet. Create sub-folders in the mobile app to organize decks.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {subWorkspaces.map((sw) => (
                                        <SubWorkspaceTile key={sw.id} workspace={sw} />
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : null}

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-border overflow-x-auto">
                        {(
                            [
                                ['cards', 'Cards'],
                                ['notes', 'Notes'],
                                ['imports', 'Imports'],
                            ] as const
                        ).map(([id, label]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={`px-4 py-3 text-sm font-bold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                                    tab === id
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-foreground-muted hover:text-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab === 'cards' && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-foreground">
                                    Cards
                                    <span className="text-foreground-muted font-normal text-sm ml-2">
                                        ({cards.length})
                                    </span>
                                </h3>
                                <Link
                                    to={`/dashboard/edit-deck/${deckId}`}
                                    className="text-sm font-semibold text-brand-primary hover:underline"
                                >
                                    Manage cards
                                </Link>
                            </div>
                            {cardsLoading ? (
                                <div className="flex items-center gap-2 text-foreground-secondary py-8">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Loading cards…
                                </div>
                            ) : cards.length === 0 ? (
                                <p className="text-foreground-secondary text-sm py-8 text-center border border-dashed border-border rounded-2xl">
                                    No cards yet. Add some in the editor.
                                </p>
                            ) : (
                                <ul className="rounded-2xl border border-border divide-y divide-border bg-surface overflow-hidden">
                                    {cards.map((c) => (
                                        <li
                                            key={c.id}
                                            className="flex items-stretch gap-4 px-4 py-3 hover:bg-surface-hover/80 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0 grid sm:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-foreground-muted mb-1">
                                                        Front
                                                    </p>
                                                    <p className="text-sm text-foreground line-clamp-3">{c.front}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-foreground-muted mb-1">
                                                        Back
                                                    </p>
                                                    <p className="text-sm text-foreground-secondary line-clamp-3">
                                                        {c.back}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="self-center p-2 text-foreground-muted hover:text-foreground"
                                                aria-label="Card options"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}

                    {tab === 'notes' && (
                        <section className="rounded-2xl border border-border bg-surface p-8 text-center">
                            <p className="text-foreground-secondary text-sm max-w-md mx-auto">
                                Deck-level notes will sync here later. For lecture notes, open{' '}
                                <Link to="/dashboard/decks?tab=lectures" className="text-brand-primary font-semibold">
                                    Library
                                </Link>
                                .
                            </p>
                        </section>
                    )}

                    {tab === 'imports' && (
                        <section className="rounded-2xl border border-border bg-surface p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary mb-3">
                                <FolderInput className="w-6 h-6" />
                            </div>
                            <p className="text-foreground-secondary text-sm max-w-md mx-auto">
                                Import from Quizlet and other sources.
                            </p>
                        </section>
                    )}
                </FadeInUp>
            </div>
        </div>
    );
}

function SubWorkspaceTile({ workspace }: { workspace: WorkspaceRow }) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        void db.getWorkspaceCardCount(workspace.id).then((n) => {
            if (!cancelled) setCount(n);
        });
        return () => {
            cancelled = true;
        };
    }, [workspace.id]);

    return (
        <Link
            to={`/dashboard/workspaces/${workspace.id}`}
            className="flex flex-col rounded-2xl border border-border bg-surface overflow-hidden hover:border-brand-primary/35 hover:shadow-md transition-all text-left group"
        >
            <div
                className="h-2 w-full"
                style={{ backgroundColor: workspace.color || '#3B82F6' }}
            />
            <div className="p-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary transition-colors">
                        {workspace.name}
                    </h3>
                    <p className="text-xs text-foreground-muted mt-1">
                        {count === null ? '…' : `${count} cards`} in folder
                    </p>
                </div>
                <Layers className="w-5 h-5 text-foreground-muted shrink-0" />
            </div>
        </Link>
    );
}
