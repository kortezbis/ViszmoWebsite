import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { Search, FileText, Loader2, ChevronRight } from 'lucide-react';
import { db, type LectureNote } from '../../services/database';

/** Library list — each lecture opens its own detail page (aligned with mobile lecture screen). */
export default function TranscriptPage() {
    const [items, setItems] = useState<LectureNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await db.getLectureNotes();
            setItems(list);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Could not load transcripts';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const filtered = items.filter((t) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            t.title.toLowerCase().includes(q) ||
            t.content.toLowerCase().includes(q) ||
            (t.summary?.toLowerCase().includes(q) ?? false)
        );
    });

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <FadeInUp>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Transcripts</h1>
                        <p className="text-foreground-secondary mt-1">
                            Open a lecture for summary, full transcript, and chat (same account as mobile).
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                            <input
                                type="text"
                                placeholder="Search transcripts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary min-w-[240px]"
                            />
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center gap-2 text-foreground-secondary py-12 justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading transcripts…</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-2xl border border-error/30 bg-error/5 text-error px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="bg-surface rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-border min-h-[320px]">
                        <div className="w-20 h-20 bg-background-elevated rounded-2xl flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-foreground-muted" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">No transcripts yet</h3>
                        <p className="text-foreground-secondary max-w-md leading-relaxed">
                            Record or import on mobile or desktop; they sync here for the same signed-in user.
                        </p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <ul className="space-y-2">
                        {filtered.map((t) => (
                            <li key={t.id}>
                                <Link
                                    to={`/dashboard/transcripts/${t.id}`}
                                    className="flex items-center justify-between gap-4 w-full rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-hover hover:border-brand-primary/30 transition-colors text-left group"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-2">
                                            {t.title}
                                        </div>
                                        <div className="text-xs text-foreground-secondary mt-1">
                                            {t.date}
                                            {t.duration ? ` · ${t.duration}` : ''}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-foreground-muted shrink-0 group-hover:text-brand-primary transition-colors" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </FadeInUp>
        </div>
    );
}
