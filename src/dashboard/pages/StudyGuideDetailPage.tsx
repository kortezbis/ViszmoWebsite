import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import {
    ArrowLeft,
    MessageCircle,
    BookMarked,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { db, type StudyGuide } from '../../services/database';

const CHAT_STARTERS: { label: string; prompt: string }[] = [
    {
        label: 'Quiz me',
        prompt: 'Generate a short quiz based on this study guide to test my knowledge.',
    },
    {
        label: 'Explain simply',
        prompt: 'Explain the main concepts of this study guide as if I were a beginner.',
    },
    {
        label: 'Key terms',
        prompt: 'Extract and define the most important terminology from this study guide.',
    },
];

function chatUrl(guideId: string, seedPrompt?: string) {
    const q = new URLSearchParams({ guideId });
    if (seedPrompt) q.set('seedPrompt', seedPrompt);
    return `/dashboard/chat?${q.toString()}`;
}

export default function StudyGuideDetailPage() {
    const { guideId } = useParams<{ guideId: string }>();
    const [guide, setGuide] = useState<StudyGuide | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!guideId) return;
        setLoading(true);
        setError(null);
        try {
            const row = await db.getStudyGuideById(guideId);
            setGuide(row ?? null);
            if (!row) setError('This study guide could not be found.');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not load study guide');
        } finally {
            setLoading(false);
        }
    }, [guideId]);

    useEffect(() => {
        void load();
    }, [load]);

    if (!guideId) {
        return null;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen pb-24">
            <FadeInUp>
                <div className="mb-8">
                    <Link
                        to="/dashboard/decks?tab=Study%20Guides"
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-brand-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Library
                    </Link>

                    {loading && (
                        <div className="flex items-center gap-2 text-foreground-secondary py-12">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading study guide…</span>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="rounded-2xl border border-error/30 bg-error/5 text-error px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {!loading && guide && (
                        <>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <BookMarked size={20} className="text-amber-500" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-foreground leading-tight">{guide.title}</h1>
                                    </div>
                                    <p className="text-foreground-secondary mt-2 text-sm">
                                        {new Date(guide.createdAt).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                        {guide.topic ? ` · ${guide.topic}` : ''}
                                        {guide.workspaceId ? (
                                            <span className="text-foreground-muted"> · Workspace</span>
                                        ) : null}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 shrink-0">
                                    <Link
                                        to={chatUrl(guide.id)}
                                        className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Chat about guide
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                                    <Sparkles className="w-4 h-4 text-brand-primary" />
                                    Quick prompts (opens Study Chat)
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {CHAT_STARTERS.map((c) => (
                                        <Link
                                            key={c.label}
                                            to={chatUrl(guide.id, c.prompt)}
                                            className="text-xs font-semibold px-3 py-2 rounded-xl bg-background-elevated border border-border hover:border-brand-primary/40 text-foreground-secondary hover:text-foreground transition-colors"
                                        >
                                            {c.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 max-w-none">
                                <div className="space-y-4 text-foreground bg-surface border border-border rounded-2xl p-6 shadow-sm">
                                    {guide.content ? (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{guide.content}</p>
                                    ) : (
                                        <p className="text-foreground-secondary text-sm">
                                            This study guide is empty.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </FadeInUp>
        </div>
    );
}
