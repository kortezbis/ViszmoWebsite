import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    BookMarked,
    MessageCircle,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { db, type StudyGuide } from '../../services/database';
import { SEO } from '../components/SEO';

// ─── Content parser (ported from mobile study-guide-details.tsx) ─────────────

type BlockSection = 'outline' | 'quick_ref';

interface Block {
    type: 'heading' | 'bullet' | 'text' | 'table' | 'spacer';
    text?: string;
    level?: number;
    rows?: string[][];
    section: BlockSection;
}

function parseBlocks(content: string): Block[] {
    const blocks: Block[] = [];
    let currentTable: string[][] | null = null;
    let currentSection: BlockSection = 'quick_ref';

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Table rows
        if (line.startsWith('|') && line.endsWith('|')) {
            if (!currentTable) {
                currentTable = [];
                blocks.push({ type: 'table', rows: currentTable, section: currentSection });
            }
            if (line.replace(/[\s|:\-]/g, '').length === 0) continue;
            const cells = line.split('|').slice(1, -1).map((c) => c.trim());
            currentTable.push(cells);
            continue;
        } else {
            currentTable = null;
        }

        if (!line) {
            blocks.push({ type: 'spacer', section: currentSection });
            continue;
        }

        // Headings
        const isHeading =
            line.startsWith('#') ||
            (line.length < 50 && line === line.toUpperCase() && line.length > 3);
        if (isHeading) {
            const headerText = line.replace(/^#+\s*/, '').toLowerCase();
            if (
                headerText.includes('overview') ||
                headerText.includes('summary') ||
                headerText.includes('reference') ||
                headerText.includes('introduction')
            ) {
                currentSection = 'quick_ref';
            } else {
                currentSection = 'outline';
            }
            let level = 1;
            if (line.startsWith('###')) level = 3;
            else if (line.startsWith('##')) level = 2;
            blocks.push({
                type: 'heading',
                level,
                text: line.replace(/^#+\s*/, ''),
                section: currentSection,
            });
            continue;
        }

        // Bullets
        if (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./)) {
            blocks.push({
                type: 'bullet',
                text: line.replace(/^[\-•\d.]+\s*/, ''),
                section: currentSection,
            });
            continue;
        }

        blocks.push({ type: 'text', text: line, section: currentSection });
    }
    return blocks;
}

// Renders **bold** segments inline
function FormattedText({ text }: { text: string }) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={i} className="font-bold text-foreground">
                        {part.slice(2, -2)}
                    </strong>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}

// ─── Chat helper ──────────────────────────────────────────────────────────────

const CHAT_STARTERS = [
    { label: 'Quiz me', prompt: 'Generate a short quiz based on this study guide to test my knowledge.' },
    { label: 'Explain simply', prompt: 'Explain the main concepts of this study guide as if I were a beginner.' },
    { label: 'Key terms', prompt: 'Extract and define the most important terminology from this study guide.' },
];

function chatUrl(guideId: string, seedPrompt?: string) {
    const q = new URLSearchParams({ guideId });
    if (seedPrompt) q.set('seedPrompt', seedPrompt);
    return `/dashboard/chat?${q.toString()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const tabs = ['Outline', 'Quick Reference'] as const;
type TabId = (typeof tabs)[number];

export default function StudyGuideDetailPage() {
    const { guideId } = useParams<{ guideId: string }>();
    const navigate = useNavigate();

    const [guide, setGuide] = useState<StudyGuide | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('Outline');

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

    useEffect(() => { void load(); }, [load]);

    const parsedBlocks = useMemo(() => {
        if (!guide?.content) return [];
        return parseBlocks(guide.content);
    }, [guide?.content]);

    const visibleBlocks = useMemo(() => {
        const section: BlockSection = activeTab === 'Outline' ? 'outline' : 'quick_ref';
        return parsedBlocks.filter((b) => b.section === section);
    }, [parsedBlocks, activeTab]);

    if (!guideId) return null;

    return (
        <div className="w-full h-full overflow-y-auto bg-background">
            <SEO
                title={guide?.title || 'Study Guide'}
                description={`Comprehensive study guide for ${guide?.title || 'your topic'}. Powered by Viszmo AI.`}
            />

            {/* ── Sticky Header (mirrors WorkspaceDetailPage) ── */}
            <div className="sticky top-14 md:top-0 z-20 bg-background/95 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 pt-8 pb-2">
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-surface-hover rounded-full text-foreground transition-all shrink-0 active:scale-90"
                                aria-label="Back"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                <BookMarked size={16} className="text-amber-500" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">
                                    {loading ? 'Loading…' : guide?.title || 'Study Guide'}
                                </h1>
                            </div>
                        </div>

                        {/* Study Chat button */}
                        {guide && (
                            <a
                                href={chatUrl(guide.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-sm active:scale-95 shrink-0"
                            >
                                <MessageCircle size={16} />
                                <span className="hidden sm:inline">Study Chat</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* ── Tab navigation (identical style to WorkspaceDetailPage) ── */}
                <div className="border-b border-border">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex gap-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold transition-all relative ${
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
            </div>

            {/* ── Page content ── */}
            <div className="max-w-4xl mx-auto px-6 py-8 pb-40 min-h-[70vh]">
                {/* Loading */}
                {loading && (
                    <div className="flex items-center gap-3 text-foreground-secondary py-20 justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading study guide…</span>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 text-red-500 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {/* Content */}
                {!loading && guide && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                        {/* Quick prompts strip */}
                        <div className="mb-8 rounded-2xl border border-border bg-surface p-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                                <Sparkles className="w-4 h-4 text-brand-primary" />
                                Quick prompts (opens Study Chat)
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {CHAT_STARTERS.map((c) => (
                                    <a
                                        key={c.label}
                                        href={chatUrl(guide.id, c.prompt)}
                                        className="text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border hover:border-brand-primary/40 text-foreground-secondary hover:text-foreground transition-colors"
                                    >
                                        {c.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Parsed content blocks */}
                        {visibleBlocks.length === 0 ? (
                            <div className="text-foreground-secondary text-sm py-10 text-center">
                                No content in this section yet.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {visibleBlocks.map((block, idx) => {
                                    if (block.type === 'spacer') {
                                        return <div key={idx} className="h-4" />;
                                    }

                                    if (block.type === 'heading') {
                                        const cls =
                                            block.level === 1
                                                ? 'text-2xl font-bold text-foreground mt-6 mb-4'
                                                : block.level === 2
                                                ? 'text-xl font-bold text-foreground mt-5 mb-3'
                                                : 'text-lg font-bold text-foreground mt-4 mb-2';
                                        return (
                                            <p key={idx} className={cls}>
                                                {block.text}
                                            </p>
                                        );
                                    }

                                    if (block.type === 'bullet') {
                                        return (
                                            <div key={idx} className="flex items-start gap-3 py-1 pr-2">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-foreground-muted shrink-0" />
                                                <p className="text-sm leading-relaxed text-foreground-secondary">
                                                    <FormattedText text={block.text ?? ''} />
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (block.type === 'table' && block.rows) {
                                        return (
                                            <div
                                                key={idx}
                                                className="overflow-x-auto rounded-xl border border-border mb-5"
                                            >
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        {block.rows.map((row, rIdx) => (
                                                            <tr
                                                                key={rIdx}
                                                                className={`border-b border-border last:border-0 ${
                                                                    rIdx === 0 ? 'bg-surface font-bold text-foreground' : ''
                                                                }`}
                                                            >
                                                                {row.map((cell, cIdx) => (
                                                                    <td
                                                                        key={cIdx}
                                                                        className={`px-4 py-3 text-foreground-secondary ${
                                                                            cIdx < row.length - 1
                                                                                ? 'border-r border-border'
                                                                                : ''
                                                                        } ${rIdx === 0 ? 'text-foreground' : ''}`}
                                                                    >
                                                                        <FormattedText text={cell} />
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    }

                                    // Plain text
                                    return (
                                        <p
                                            key={idx}
                                            className="text-sm leading-relaxed text-foreground-secondary"
                                        >
                                            <FormattedText text={block.text ?? ''} />
                                        </p>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
