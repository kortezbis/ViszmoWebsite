import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    BrainCircuit,
    ClipboardCheck,
    Layers,
    Loader2,
    Mic,
    PenTool,
    Puzzle,
    Sparkles,
    Zap,
} from 'lucide-react';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { db, type DeckRow, type WorkspaceRow } from '../../services/database';

const STUDY_MODES: { label: string; path: string; icon: typeof Layers; description: string }[] = [
    { label: 'Flashcards', path: '/dashboard/flashcards', icon: Layers, description: 'Flip through terms' },
    { label: 'Learn', path: '/dashboard/learn', icon: BrainCircuit, description: 'Adaptive course' },
    { label: 'Rapid Fire', path: '/dashboard/quiz', icon: Zap, description: 'Quick recall' },
    { label: 'Matching', path: '/dashboard/match', icon: Puzzle, description: 'Match pairs' },
    { label: 'Written', path: '/dashboard/written', icon: PenTool, description: 'Type answers' },
    { label: 'Speaking', path: '/dashboard/speaking', icon: Mic, description: 'Speak answers' },
    { label: 'Practice Test', path: '/dashboard/test', icon: ClipboardCheck, description: 'Exam style' },
];

/** Folder hub (iOS `workspace-details`): nested sub-folders + decks inside a workspace. */
export default function WorkspaceDetailPage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
    const [subWorkspaces, setSubWorkspaces] = useState<WorkspaceRow[]>([]);
    const [decks, setDecks] = useState<DeckRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        setError(null);
        try {
            const [ws, sw, d] = await Promise.all([
                db.getWorkspaceById(workspaceId),
                db.getSubWorkspaces(workspaceId),
                db.getDecksByWorkspace(workspaceId),
            ]);
            if (!ws) {
                setError('Folder not found.');
                setWorkspace(null);
            } else {
                setWorkspace(ws);
            }
            setSubWorkspaces(sw);
            setDecks(d);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        void load();
    }, [load]);

    const firstDeckId = decks[0]?.id;
    const deckQuery = firstDeckId ? `?deckId=${encodeURIComponent(firstDeckId)}` : '';

    if (!workspaceId) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-foreground-secondary text-sm">Loading folder…</p>
            </div>
        );
    }

    if (error || !workspace) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-error text-sm">{error || 'Not found'}</p>
                <Link to="/dashboard/decks" className="text-brand-primary font-semibold">
                    Back to library
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div
                className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20"
                style={{ boxShadow: `inset 0 -1px 0 0 ${workspace.color}22` }}
            >
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div
                                className="w-14 h-14 rounded-2xl shrink-0 border-2 flex items-center justify-center"
                                style={{
                                    borderColor: workspace.color || '#3B82F6',
                                    backgroundColor: `${workspace.color || '#3B82F6'}22`,
                                }}
                            >
                                <Layers className="w-7 h-7" style={{ color: workspace.color || '#3B82F6' }} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                                    {workspace.name}
                                </h1>
                                <p className="text-foreground-secondary text-sm mt-1">
                                    {decks.length} deck{decks.length === 1 ? '' : 's'} · {subWorkspaces.length} sub-folder
                                    {subWorkspaces.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                        {firstDeckId ? (
                            <Link
                                to={`/dashboard/flashcards${deckQuery}`}
                                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25 shrink-0"
                            >
                                <Sparkles className="w-4 h-4" />
                                Study folder
                            </Link>
                        ) : (
                            <span className="text-sm text-foreground-muted">Add a deck to study this folder</span>
                        )}
                    </div>

                    {firstDeckId ? (
                        <div className="rounded-2xl border border-border bg-background-elevated p-4">
                            <h2 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">
                                Study modes (uses first deck in folder)
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {STUDY_MODES.map((m) => (
                                    <Link
                                        key={m.path}
                                        to={`${m.path}${deckQuery}`}
                                        className="flex items-start gap-3 p-3 rounded-xl border border-border/80 bg-surface hover:border-brand-primary/40 transition-colors"
                                    >
                                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                                            <m.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{m.label}</div>
                                            <div className="text-[11px] text-foreground-muted">{m.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-10">
                <FadeInUp>
                    {subWorkspaces.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-foreground mb-3">Sub-decks</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {subWorkspaces.map((sw) => (
                                    <Link
                                        key={sw.id}
                                        to={`/dashboard/workspaces/${sw.id}`}
                                        className="flex flex-col rounded-2xl border border-border bg-surface overflow-hidden hover:border-brand-primary/35 transition-all"
                                    >
                                        <div
                                            className="h-2 w-full"
                                            style={{ backgroundColor: sw.color || '#3B82F6' }}
                                        />
                                        <div className="p-4 font-bold text-foreground">{sw.name}</div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="text-lg font-bold text-foreground mb-3">Decks in this folder</h2>
                        {decks.length === 0 ? (
                            <p className="text-foreground-secondary text-sm py-6 border border-dashed border-border rounded-2xl px-4">
                                No decks in this folder yet.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {decks.map((d) => (
                                    <li key={d.id}>
                                        <Link
                                            to={`/dashboard/decks/${d.id}`}
                                            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-hover hover:border-brand-primary/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <BookOpen className="w-5 h-5 text-brand-primary shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="font-bold text-foreground truncate">{d.title}</div>
                                                    <div className="text-xs text-foreground-muted">
                                                        {d.cardCount} cards
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-brand-primary">Open</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </FadeInUp>
            </div>
        </div>
    );
}
