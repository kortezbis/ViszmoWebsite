import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { db } from '../../services/database';
import { usePodcastGeneration } from '../contexts/PodcastGenerationContext';
import { useDecks } from '../contexts/DecksContext';

const PODCAST_TTS_VOICES = [
    { id: 'nova', name: 'Nova (Energetic, Female)' },
    { id: 'shimmer', name: 'Shimmer (Soft, Female)' },
    { id: 'alloy', name: 'Alloy (Neutral, Balanced)' },
    { id: 'onyx', name: 'Onyx (Deep, Male)' },
    { id: 'echo', name: 'Echo (Warm, Male)' },
    { id: 'fable', name: 'Fable (Expressive, Male)' },
    { id: 'ash', name: 'Ash (Calm, Male)' },
    { id: 'sage', name: 'Sage (Measured, Male)' },
    { id: 'coral', name: 'Coral (Bright, Female)' },
    { id: 'verse', name: 'Verse (Narrative, Male)' },
    { id: 'ballad', name: 'Ballad (Storytelling, Female)' },
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese', 'Italian', 'Hindi', 'Korean'] as const;

const PODCAST_TYPES = [
    'Educational', 'Conversational', 'Interview-style',
    'Narrative / Story', 'News briefing', 'Deep dive lecture',
];

const DURATIONS = ['~5 min', '~10 min', '~15 min', '~20 min', '~30 min'];

const GRADE_LEVELS = ['Elementary', 'Middle School', 'High School', 'College', 'Graduate', 'Professional'] as const;

const MAX_CONTENT_CHARS = 60000;

export interface PodcastRoutePayload {
    source: 'deck' | 'custom';
    customContent?: string;
    customTitle?: string;
}

interface GeneratePodcastFormProps {
    workspaceId: string;
    payload: PodcastRoutePayload;
    onClose?: () => void;
}

export default function GeneratePodcastForm({ workspaceId, payload, onClose }: GeneratePodcastFormProps) {
    const { startGeneration } = usePodcastGeneration();
    const { workspaces } = useDecks();

    const workspace = workspaces.find(w => w.id === workspaceId);

    const [selectedLanguage, setSelectedLanguage] = useState<string>(LANGUAGES[0]);
    const [selectedType, setSelectedType] = useState(PODCAST_TYPES[0]);
    const [selectedVoice, setSelectedVoice] = useState('nova');
    const [selectedDuration, setSelectedDuration] = useState('~10 min');
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>(GRADE_LEVELS[3]);
    const [focusArea, setFocusArea] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [queued, setQueued] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGenerate = async () => {
        setError(null);
        setIsSubmitting(true);

        let content = '';
        let titleHint = 'Study Podcast';

        try {
            if (payload.source === 'custom' && payload.customContent?.trim()) {
                content = payload.customContent.trim();
                titleHint = payload.customTitle?.trim() || titleHint;
            } else {
                const workspaceContent = await db.getWorkspaceContent(workspaceId);
                if (!workspaceContent.trim()) {
                    throw new Error('Add flashcards or notes to this deck before generating a podcast.');
                }
                const workspaceTitle = workspace?.name || 'Workspace';
                titleHint = workspaceTitle;
                content = `Workspace: ${workspaceTitle}\n\nContent:\n${workspaceContent}`;
            }

            if (content.length > MAX_CONTENT_CHARS) {
                content = content.slice(0, MAX_CONTENT_CHARS);
            }

            startGeneration({
                workspaceId,
                content,
                titleHint,
                language: selectedLanguage,
                podcastType: selectedType,
                duration: selectedDuration,
                gradeLevel: selectedGradeLevel,
                focus: focusArea.trim() || undefined,
                voice: selectedVoice,
            });

            setQueued(true);
            setTimeout(() => {
                if (onClose) onClose();
            }, 1200);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start generation');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (queued) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center">
                    <Check size={40} className="text-green-500" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black">Podcast Queued!</h2>
                    <p className="text-foreground-secondary text-sm font-medium">
                        Your podcast is generating in the background.<br />
                        You'll get a notification when it's ready.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin">
            <p className="text-sm text-foreground-secondary font-medium leading-relaxed">
                {payload.source === 'deck'
                    ? 'Using your deck content. Tune language, format, length, level, and narrator voice.'
                    : 'Using your uploaded or pasted material. Adjust how it should sound, including narrator voice.'}
            </p>

            <div className="space-y-4">
                <SettingRow label="Choose Language">
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold"
                    >
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </SettingRow>

                <SettingRow label="Type of podcast">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold"
                    >
                        {PODCAST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </SettingRow>

                <SettingRow label="Duration">
                    <select
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(e.target.value)}
                        className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold"
                    >
                        {DURATIONS.map(d => <option key={d} value={d}>{d.replace('~', '')}</option>)}
                    </select>
                </SettingRow>

                <SettingRow label="Grade level">
                    <select
                        value={selectedGradeLevel}
                        onChange={(e) => setSelectedGradeLevel(e.target.value)}
                        className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold"
                    >
                        {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </SettingRow>

                <SettingRow label="Narrator voice">
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold"
                    >
                        {PODCAST_TTS_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </SettingRow>
            </div>

            <section className="space-y-2">
                <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">
                    What should the podcast focus on? (optional)
                </label>
                <textarea
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    placeholder="e.g. Exam vocabulary only, common misconceptions…"
                    className="w-full h-24 p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-medium resize-none leading-relaxed"
                />
            </section>

            <div className="pt-2 sticky bottom-0 bg-background/80 backdrop-blur-sm pb-2">
                {error && <p className="text-red-500 text-[10px] font-bold text-center mb-3">{error}</p>}
                <button
                    onClick={() => void handleGenerate()}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-base shadow-xl shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    Create Podcast
                </button>
            </div>
        </div>
    );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium text-foreground sm:flex-1">{label}</span>
            <div className="sm:flex-1 sm:max-w-[260px] sm:ml-auto w-full">{children}</div>
        </div>
    );
}
