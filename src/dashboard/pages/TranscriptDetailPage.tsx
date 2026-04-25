import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import {
    ArrowLeft,
    MessageCircle,
    FileText,
    BookOpen,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { db, type LectureNote } from '../../services/database';

/** Same starter prompts as mobile `lecture-details` (transcript chat chips) — shared behavior via Study Chat + `transcript_chat` API. */
const CHAT_STARTERS: { label: string; prompt: string }[] = [
    {
        label: 'Rewrite notes',
        prompt:
            'Rewrite the main ideas from this transcript as clearer, structured study notes with short sections and bullets where helpful.',
    },
    {
        label: 'Expand',
        prompt:
            'Expand on this transcript with more detail, examples, and explanations while staying faithful to what was said.',
    },
    {
        label: 'Short summary',
        prompt: 'Summarize this transcript into a tight set of bullet points—only the essentials.',
    },
];

function chatUrl(transcriptId: string, seedPrompt?: string) {
    const q = new URLSearchParams({ transcriptId });
    if (seedPrompt) q.set('seedPrompt', seedPrompt);
    return `/dashboard/chat?${q.toString()}`;
}

export default function TranscriptDetailPage() {
    const { transcriptId } = useParams<{ transcriptId: string }>();
    const [note, setNote] = useState<LectureNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<'summary' | 'transcript'>('summary');

    const load = useCallback(async () => {
        if (!transcriptId) return;
        setLoading(true);
        setError(null);
        try {
            const row = await db.getLectureNoteById(transcriptId);
            setNote(row ?? null);
            if (!row) setError('This transcript could not be found.');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not load transcript');
        } finally {
            setLoading(false);
        }
    }, [transcriptId]);

    useEffect(() => {
        void load();
    }, [load]);

    if (!transcriptId) {
        return null;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen pb-24">
            <FadeInUp>
                <div className="mb-8">
                    <Link
                        to="/dashboard/decks?tab=lectures"
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-brand-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Library
                    </Link>

                    {loading && (
                        <div className="flex items-center gap-2 text-foreground-secondary py-12">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading lecture…</span>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="rounded-2xl border border-error/30 bg-error/5 text-error px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {!loading && note && (
                        <>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground leading-tight">{note.title}</h1>
                                    <p className="text-foreground-secondary mt-2 text-sm">
                                        {note.date}
                                        {note.duration ? ` · ${note.duration}` : ''}
                                        {note.workspaceId ? (
                                            <span className="text-foreground-muted"> · Workspace</span>
                                        ) : null}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 shrink-0">
                                    <Link
                                        to={chatUrl(note.id)}
                                        className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Chat about lecture
                                    </Link>
                                    {note.flashcardDeckId ? (
                                        <Link
                                            to={`/dashboard/edit-deck/${note.flashcardDeckId}`}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-border bg-surface hover:bg-surface-hover transition-colors"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Linked deck
                                        </Link>
                                    ) : null}
                                </div>
                            </div>

                            {/* Linked feature: same AI gateway as iOS; starters deep-link into Study Chat with context */}
                            <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                                    <Sparkles className="w-4 h-4 text-brand-primary" />
                                    Quick prompts (opens Study Chat)
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {CHAT_STARTERS.map((c) => (
                                        <Link
                                            key={c.label}
                                            to={chatUrl(note.id, c.prompt)}
                                            className="text-xs font-semibold px-3 py-2 rounded-xl bg-background-elevated border border-border hover:border-brand-primary/40 text-foreground-secondary hover:text-foreground transition-colors"
                                        >
                                            {c.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-8 border-b border-border">
                                <button
                                    type="button"
                                    onClick={() => setTab('summary')}
                                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
                                        tab === 'summary'
                                            ? 'border-brand-primary text-brand-primary'
                                            : 'border-transparent text-foreground-muted hover:text-foreground'
                                    }`}
                                >
                                    Summary
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTab('transcript')}
                                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors inline-flex items-center gap-2 ${
                                        tab === 'transcript'
                                            ? 'border-brand-primary text-brand-primary'
                                            : 'border-transparent text-foreground-muted hover:text-foreground'
                                    }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Transcript
                                </button>
                            </div>

                            <div className="mt-6 max-w-none">
                                {tab === 'summary' && (
                                    <div className="space-y-4 text-foreground">
                                        {note.summary ? (
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.summary}</p>
                                        ) : (
                                            <p className="text-foreground-secondary text-sm">
                                                No summary stored for this lecture. Use Chat about lecture to ask for
                                                notes or a summary.
                                            </p>
                                        )}
                                        {note.keyTakeaways && note.keyTakeaways.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground-muted uppercase tracking-wide mb-2">
                                                    Key takeaways
                                                </h3>
                                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                                    {note.keyTakeaways.map((k, i) => (
                                                        <li key={i}>{k}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {tab === 'transcript' && (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                        {note.content || '—'}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </FadeInUp>
        </div>
    );
}
