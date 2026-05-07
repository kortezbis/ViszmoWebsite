import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Podcast, Sparkles, Loader2, Check, Info, Music } from 'lucide-react';
import { db, type LectureNote, type StudyGuide, type Deck } from '../../services/database';
import { invokeAiGateway } from '../../services/aiGateway';

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

const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Mandarin', 
    'Japanese', 'Portuguese', 'Italian', 'Hindi', 'Korean'
];

const PODCAST_TYPES = [
    'Educational', 'Conversational', 'Interview-style', 
    'Narrative / Story', 'News briefing', 'Deep dive lecture'
];

const DURATIONS = [
    { id: '~5 min', label: '5 Minutes' },
    { id: '~10 min', label: '10 Minutes' },
    { id: '~15 min', label: '15 Minutes' },
    { id: '~20 min', label: '20 Minutes' },
    { id: '~30 min', label: '30 Minutes' },
];

const GRADE_LEVELS = [
    'Elementary', 'Middle School', 'High School', 
    'College', 'Graduate', 'Professional'
];

interface GeneratePodcastFormProps {
    workspaceId?: string;
    onClose?: () => void;
}

export default function GeneratePodcastForm({ workspaceId, onClose }: GeneratePodcastFormProps) {
    const navigate = useNavigate();

    const [lectures, setLectures] = useState<LectureNote[]>([]);
    const [guides, setGuides] = useState<StudyGuide[]>([]);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loadingSources, setLoadingSources] = useState(true);

    const [selectedSourceType, setSelectedSourceType] = useState<'workspace' | 'lecture' | 'guide' | 'deck' | 'text'>(workspaceId ? 'workspace' : 'text');
    const [selectedSourceId, setSelectedSourceId] = useState<string>('');
    const [customText, setCustomText] = useState('');
    
    // Settings
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [selectedType, setSelectedType] = useState('Educational');
    const [selectedVoice, setSelectedVoice] = useState('nova');
    const [selectedDuration, setSelectedDuration] = useState('~10 min');
    const [selectedGradeLevel, setSelectedGradeLevel] = useState('College');
    const [focusArea, setFocusArea] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState<'script' | 'audio' | 'saving' | 'done'>('script');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSources = async () => {
            try {
                const [l, g, d] = await Promise.all([
                    db.getLectureNotes(),
                    db.getStudyGuides(),
                    db.getDecks()
                ]);
                setLectures(workspaceId ? l.filter(x => x.workspaceId === workspaceId) : l);
                setGuides(workspaceId ? g.filter(x => x.workspaceId === workspaceId) : g);
                setDecks(workspaceId ? d.filter(x => x.workspaceId === workspaceId) : d);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSources(false);
            }
        };
        loadSources();
    }, [workspaceId]);

    const handleGenerate = async () => {
        if (isGenerating) return;
        setError(null);

        let content = '';
        let titleHint = 'Study Podcast';

        try {
            if (selectedSourceType === 'workspace') {
                content = await db.getWorkspaceContent(workspaceId);
                if (!content.trim()) throw new Error('No content found in this workspace to use.');
            } else if (selectedSourceType === 'lecture') {
                const l = lectures.find(x => x.id === selectedSourceId);
                if (!l) throw new Error('Please select a lecture');
                content = l.content;
                titleHint = l.title;
            } else if (selectedSourceType === 'guide') {
                const g = guides.find(x => x.id === selectedSourceId);
                if (!g) throw new Error('Please select a study guide');
                content = g.content;
                titleHint = g.title;
            } else if (selectedSourceType === 'deck') {
                const d = decks.find(x => x.id === selectedSourceId);
                if (!d) throw new Error('Please select a deck');
                const cards = await db.getFlashcardsByDeckId(d.id);
                content = cards.map(c => `Q: ${c.front}\nA: ${c.back}`).join('\n\n');
                titleHint = d.title;
            } else {
                if (!customText.trim()) throw new Error('Please enter some text');
                content = customText;
            }

            setIsGenerating(true);
            setGenerationStep('script');

            const scriptRes = await invokeAiGateway<{ title: string; script: string }>('podcast_script', {
                content,
                language: selectedLanguage,
                podcastType: selectedType,
                duration: selectedDuration,
                gradeLevel: selectedGradeLevel,
                focus: focusArea.trim() || undefined
            });

            setGenerationStep('audio');
            const audioRes = await invokeAiGateway<{ audioBase64: string; mimeType: string }>('podcast_tts', {
                text: scriptRes.script,
                voice: selectedVoice
            });

            setGenerationStep('saving');
            const podcastId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
            const fileName = `${workspaceId || 'global'}/${podcastId}.mp3`;
            
            const byteCharacters = atob(audioRes.audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mpeg' });

            const publicUrl = await db.uploadPodcastAudio(fileName, blob);

            await db.savePodcast({
                id: podcastId,
                workspaceId: workspaceId || '',
                title: scriptRes.title || `Podcast: ${titleHint}`,
                audioUrl: publicUrl,
                script: { text: scriptRes.script },
                voiceId: selectedVoice
            });

            setGenerationStep('done');
            setTimeout(() => {
                if (onClose) onClose();
                navigate(`/dashboard/podcasts/${podcastId}`);
            }, 1000);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Generation failed');
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center relative">
                    <Podcast size={40} className="text-brand-primary animate-pulse" />
                    <div className="absolute -right-2 -bottom-2 bg-brand-primary text-white p-1.5 rounded-lg shadow-lg">
                        <Sparkles size={14} />
                    </div>
                </div>
                
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black">Generating Podcast</h2>
                    <p className="text-foreground-secondary text-sm font-medium">Sit back while we work our magic...</p>
                </div>
                
                <div className="w-full max-w-xs space-y-4">
                    <StepItem active={generationStep === 'script'} done={['audio', 'saving', 'done'].includes(generationStep)} label="Writing script..." index={1} />
                    <StepItem active={generationStep === 'audio'} done={['saving', 'done'].includes(generationStep)} label="Synthesizing audio..." index={2} />
                    <StepItem active={generationStep === 'saving'} done={generationStep === 'done'} label="Saving to library..." index={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin">
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">1. Source Material</h3>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                    {(['workspace', 'lecture', 'guide', 'deck', 'text'] as const).map(type => (
                        (!workspaceId && (type === 'lecture' || type === 'guide' || type === 'deck')) ? null : (
                            <button
                                key={type}
                                onClick={() => setSelectedSourceType(type)}
                                className={`py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all ${selectedSourceType === type ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-surface border-border text-foreground-secondary hover:border-foreground-muted'}`}
                            >
                                {type === 'workspace' ? 'All' : type === 'lecture' ? 'Note' : type === 'guide' ? 'Guide' : type === 'deck' ? 'Deck' : 'Text'}
                            </button>
                        )
                    ))}
                </div>

                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    {selectedSourceType === 'workspace' && (
                        <div className="p-4 bg-surface/50 border border-border rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                                <Podcast size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">Workspace Intelligence</p>
                                <p className="text-[10px] text-foreground-secondary leading-tight">We'll analyze all notes and cards in this deck.</p>
                            </div>
                        </div>
                    )}

                    {(['lecture', 'guide', 'deck'].includes(selectedSourceType)) && (
                        <select 
                            value={selectedSourceId} 
                            onChange={(e) => setSelectedSourceId(e.target.value)}
                            className="w-full p-3.5 bg-surface rounded-2xl border border-border focus:border-brand-primary outline-none text-sm font-bold"
                        >
                            <option value="">Select {selectedSourceType}...</option>
                            {selectedSourceType === 'lecture' && lectures.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                            {selectedSourceType === 'guide' && guides.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                            {selectedSourceType === 'deck' && decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                    )}

                    {selectedSourceType === 'text' && (
                        <textarea
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Paste notes or text to convert..."
                            className="w-full h-32 p-4 bg-surface rounded-2xl border border-border focus:border-brand-primary outline-none text-sm font-medium leading-relaxed resize-none"
                        />
                    )}
                </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Style</label>
                    <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold"
                    >
                        {PODCAST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Length</label>
                    <select 
                        value={selectedDuration} 
                        onChange={(e) => setSelectedDuration(e.target.value)}
                        className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold"
                    >
                        {DURATIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                </div>
            </section>

            <section className="space-y-2">
                <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Narrator Voice</label>
                <div className="grid grid-cols-2 gap-2">
                    {PODCAST_TTS_VOICES.slice(0, 4).map(v => (
                        <button
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${selectedVoice === v.id ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-surface border-border text-foreground-secondary hover:border-foreground-muted'}`}
                        >
                            <Music size={14} className={selectedVoice === v.id ? 'animate-bounce' : ''} />
                            {v.name.split(' ')[0]}
                        </button>
                    ))}
                    <select 
                        value={PODCAST_TTS_VOICES.slice(0, 4).some(v => v.id === selectedVoice) ? '' : selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="col-span-2 p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-bold mt-1"
                    >
                        <option value="" disabled>More voices...</option>
                        {PODCAST_TTS_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            </section>

            <section className="space-y-2">
                <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-1">Audience Focus (Optional)</label>
                <input
                    type="text"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    placeholder="e.g. Focus on definitions..."
                    className="w-full p-3 bg-surface rounded-xl border border-border focus:border-brand-primary outline-none text-xs font-medium"
                />
            </section>

            <div className="pt-2 sticky bottom-0 bg-background/80 backdrop-blur-sm pb-2">
                {error && <p className="text-red-500 text-[10px] font-bold text-center mb-3">{error}</p>}
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-base shadow-xl shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    Create Podcast
                </button>
            </div>
        </div>
    );
}

function StepItem({ active, done, label, index }: { active: boolean, done: boolean, label: string, index: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${done ? 'bg-green-500 text-white' : active ? 'bg-brand-primary text-white scale-110' : 'bg-surface-active text-foreground-secondary opacity-50'}`}>
                {done ? <Check size={14} /> : index}
            </div>
            <span className={`text-sm font-bold transition-colors duration-300 ${active ? 'text-foreground' : 'text-foreground-secondary opacity-60'}`}>{label}</span>
            {active && <Loader2 size={16} className="animate-spin text-brand-primary ml-auto" />}
        </div>
    );
}
