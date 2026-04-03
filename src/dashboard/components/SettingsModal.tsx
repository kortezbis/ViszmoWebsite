import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Toggle } from './ui/Toggle';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedNumber = ({ value }: { value: number }) => {
    const count = useMotionValue(value);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, value, { duration: 0.4, ease: "circOut" });
        return () => controls.stop();
    }, [value, count]);

    return <motion.span>{rounded}</motion.span>;
};

const ColorSlider = ({ value, min, max, step = 1, onChange }: { value: number, min: number, max: number, step?: number, onChange: (val: number) => void }) => {
    const range = max - min;
    const rawPercentage = range === 0 ? 0 : ((value - min) / range) * 100;
    const percentage = Math.min(Math.max(rawPercentage, 0), 100);

    return (
        <div className="relative w-32 h-6 flex items-center select-none touch-none">
            {/* Track */}
            <div className="absolute w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                />
            </div>

            {/* Thumb - using percentage for position */}
            <motion.div
                className="absolute w-4 h-4 bg-white shadow-md rounded-full border border-slate-200 z-20 pointer-events-none"
                animate={{ left: `calc(${percentage}% - 8px)` }}
                transition={{ type: "spring", bounce: 0, duration: 0.1 }}
            />

            {/* Input Overlay */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
        </div>
    );
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: string;
    description: string;
    currentSettings: any;
    onSave: (settings: any) => void;
    maxCards?: number;
}

const SettingRow = ({ label, description, control }: { label: string; description?: string; control: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 px-2 last:border-b-0 -mx-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-xl transition-colors">
        <div className="flex-1 pr-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{label}</h3>
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">{description}</p>}
        </div>
        <div className="flex-shrink-0">
            {control}
        </div>
    </div>
);

const PillSelector = ({ value, onChange, options }: { label?: string, value: string | number, onChange: (val: any) => void, options: { label: string, value: any }[] }) => (
    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl relative z-0">
        {options.map((opt) => {
            const isActive = value === opt.value;
            return (
                <button
                    key={String(opt.value)}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors duration-200 relative z-10 ${isActive ? 'text-[#0ea5e9] dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                >
                    {isActive && (
                        <motion.div
                            layoutId={`pill-active-${options[0]?.label || 'selector'}`}
                            className="absolute inset-0 bg-white dark:bg-white/[0.08] shadow-sm rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    {opt.label}
                </button>
            );
        })}
    </div>
);

export function SettingsModal({ isOpen, onClose, mode, description, currentSettings, onSave, maxCards = 999 }: SettingsModalProps) {
    const [settings, setSettings] = useState(currentSettings);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        setSettings(currentSettings);
    }, [currentSettings, isOpen]);

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        onSave(newSettings);
    };

    const effectiveMax = mode === 'Speaking Drill' ? Math.min(maxCards, 30) : maxCards;

    const renderDeckConfiguration = () => (
        <div className="mb-2">
            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Session Config</h4>
            <div className="space-y-1">
                <SettingRow
                    label="Study Favorites Only"
                    description="Limit session to your starred cards."
                    control={
                        <Toggle
                            checked={settings.favoritesOnly || false}
                            onChange={(v) => updateSetting('favoritesOnly', v)}
                        />
                    }
                />
                <SettingRow
                    label="Question Limit"
                    description="Number of cards to review in this session."
                    control={
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">
                                <AnimatedNumber value={Math.min(settings.cardLimit || 10, effectiveMax)} />
                            </span>
                            <div className="flex items-center gap-3">
                                <ColorSlider
                                    min={1}
                                    max={effectiveMax}
                                    step={1}
                                    value={Math.min(settings.cardLimit || 10, effectiveMax)}
                                    onChange={(v) => updateSetting('cardLimit', v)}
                                />
                                <button
                                    onClick={() => updateSetting('cardLimit', effectiveMax)}
                                    className="text-xs font-bold text-[#0ea5e9] bg-[#0ea5e9]/10 px-3 py-2 rounded-lg hover:bg-[#0ea5e9]/20 transition-colors"
                                >
                                    MAX
                                </button>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );

    const renderSettings = () => {
        switch (mode) {
            case 'Flashcards':
                return (
                    <div className="space-y-6">
                        {renderDeckConfiguration()}
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Display</h4>
                            <div className="space-y-1">
                                <SettingRow
                                    label="Study Direction"
                                    description="Choose which side of the card to see first."
                                    control={
                                        <div className="w-40">
                                            <PillSelector
                                                value={settings.studyDirection || 'term-def'}
                                                onChange={(v) => updateSetting('studyDirection', v)}
                                                options={[
                                                    { label: 'Term', value: 'term-def' },
                                                    { label: 'Def', value: 'def-term' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Shuffle Deck"
                                    description="Randomize the order of cards."
                                    control={
                                        <Toggle
                                            checked={settings.shuffle || false}
                                            onChange={(v) => updateSetting('shuffle', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Smart Sort"
                                    description="Prioritize cards widely missed in previous sessions."
                                    control={
                                        <Toggle
                                            checked={settings.smartSort || false}
                                            onChange={(v) => updateSetting('smartSort', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Auto-Play Audio"
                                    description="Automatically read the term aloud."
                                    control={
                                        <Toggle
                                            checked={settings.autoAudio || false}
                                            onChange={(v) => updateSetting('autoAudio', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Timer Duration"
                                    description="Seconds per card for auto-advance."
                                    control={
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">
                                                <AnimatedNumber value={settings.timer || 0} />s
                                            </span>
                                            <ColorSlider
                                                min={0}
                                                max={30}
                                                step={1}
                                                value={settings.timer || 0}
                                                onChange={(v) => updateSetting('timer', v)}
                                            />
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'Rapid Fire':
                return (
                    <div className="space-y-6">
                        {renderDeckConfiguration()}
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Objectives</h4>
                            <div className="space-y-1">
                                <div className="group bg-slate-50/50 dark:bg-white/[0.02] border border-border rounded-2xl p-4 transition-all duration-300 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-none hover:border-brand-primary/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1 pr-6">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Game Mode</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">Choose your challenge style.</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <PillSelector
                                                value={settings.subMode || 'basic'}
                                                onChange={(v) => updateSetting('subMode', v)}
                                                options={[
                                                    { label: 'Basic', value: 'basic' },
                                                    { label: 'Velocity', value: 'velocity' },
                                                    { label: 'Sudden', value: 'sudden' },
                                                    { label: 'Blitz', value: 'blitz' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="px-1 overflow-hidden relative">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={settings.subMode}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                className="pt-3 border-t border-slate-200 dark:border-white/5"
                                            >
                                                <span className="text-[11px] font-black text-brand-primary uppercase tracking-wider block mb-1">
                                                    {settings.subMode === 'velocity' ? 'Velocity Mode' :
                                                        settings.subMode === 'sudden' ? 'Sudden Death' :
                                                            settings.subMode === 'blitz' ? 'Case Blitz' : 'Basic Mode'}
                                                </span>
                                                <span className="text-xs text-foreground-secondary leading-relaxed block font-medium">
                                                    {
                                                        settings.subMode === 'velocity' ? "A 60-second 'Total Round' timer. Clear as many cards as possible before time runs out!" :
                                                            settings.subMode === 'sudden' ? "The ultimate pressure test. One wrong answer triggers an immediate Game Over." :
                                                                settings.subMode === 'blitz' ? "Analyze clinical scenarios and pick the best action within the 15-second window." :
                                                                    "The vanilla experience. 15-second timer per question. Standard point scaling."
                                                    }
                                                </span>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <SettingRow
                                label="Question Focus"
                                description="Test on Terms or Definitions."
                                control={
                                    <div className="w-auto min-w-[300px]">
                                        <PillSelector
                                            value={settings.questionFocus || 'term'}
                                            onChange={(v) => updateSetting('questionFocus', v)}
                                            options={[
                                                { label: 'Terms', value: 'term' },
                                                { label: 'Definitions', value: 'definition' },
                                                { label: 'Mix', value: 'mixed' }
                                            ]}
                                        />
                                    </div>
                                }
                            />
                            <SettingRow
                                label="Choices"
                                description="Number of options."
                                control={
                                    <div className="w-[120px]">
                                        <PillSelector
                                            value={settings.choiceCount || 4}
                                            onChange={(v) => updateSetting('choiceCount', v)}
                                            options={[
                                                { label: '2', value: 2 },
                                                { label: '3', value: 3 },
                                                { label: '4', value: 4 }
                                            ]}
                                        />
                                    </div>
                                }
                            />
                            <SettingRow
                                label="Enable Timer"
                                description="Answer questions before time runs out."
                                control={
                                    <div className="flex flex-col items-end gap-3">
                                        <Toggle
                                            checked={settings.enableTimer !== false}
                                            onChange={(v) => updateSetting('enableTimer', v)}
                                        />
                                        {settings.enableTimer !== false && (
                                            <div className="flex items-center gap-4 animate-fade-in-up">
                                                <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">
                                                    <AnimatedNumber value={settings.timer || 15} />s
                                                </span>
                                                <ColorSlider
                                                    min={5}
                                                    max={60}
                                                    step={5}
                                                    value={settings.timer || 15}
                                                    onChange={(v) => updateSetting('timer', v)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                            <SettingRow
                                label="Streak Effects"
                                description="Show background animations on high streaks."
                                control={
                                    <Toggle
                                        checked={settings.showStreakFx !== false}
                                        onChange={(v) => updateSetting('showStreakFx', v)}
                                    />
                                }
                            />
                        </div>
                    </div>
                );

            case 'Matching':
                return (
                    <div className="space-y-6">
                        {renderDeckConfiguration()}
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Difficulty</h4>
                            <div className="space-y-1">
                                <SettingRow
                                    label="Match Type"
                                    description="Include Case Studies in matching pairs?"
                                    control={
                                        <div className="w-40">
                                            <PillSelector
                                                value={settings.matchDepth || '2-way'}
                                                onChange={(v) => updateSetting('matchDepth', v)}
                                                options={[
                                                    { label: '2-way', value: '2-way' },
                                                    { label: '3-way', value: '3-way' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Decay Rate"
                                    description="How fast tiles fade over time."
                                    control={
                                        <div className="w-40">
                                            <PillSelector
                                                value={settings.decaySpeed || 'normal'}
                                                onChange={(v) => updateSetting('decaySpeed', v)}
                                                options={[
                                                    { label: 'OFF', value: 'slow' },
                                                    { label: '10s', value: 'normal' },
                                                    { label: '5s', value: 'instant' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Timer Duration"
                                    description="Time limit for the matching session."
                                    control={
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">
                                                <AnimatedNumber value={settings.timer || 60} />s
                                            </span>
                                            <ColorSlider
                                                min={10}
                                                max={300}
                                                step={10}
                                                value={settings.timer || 60}
                                                onChange={(v) => updateSetting('timer', v)}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Gravity Loop"
                                    description="Refill board with new cards after matches."
                                    control={
                                        <Toggle
                                            checked={settings.gravityLoop ?? true}
                                            onChange={(v) => updateSetting('gravityLoop', v)}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'Gravity':
                return (
                    <div className="space-y-6">
                        {renderDeckConfiguration()}
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Physics</h4>
                            <div className="space-y-1">
                                <SettingRow
                                    label="Descent Speed"
                                    description="Adjust how fast asteroids fall."
                                    control={
                                        <div className="w-40">
                                            <PillSelector
                                                value={settings.gravitySpeed || 'normal'}
                                                onChange={(v) => updateSetting('gravitySpeed', v)}
                                                options={[
                                                    { label: 'Slow', value: 'slow' },
                                                    { label: 'Normal', value: 'normal' },
                                                    { label: 'Terminal', value: 'fast' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Shields (Lives)"
                                    description="Number of impacts you can sustain."
                                    control={
                                        <div className="w-40">
                                            <PillSelector
                                                value={settings.gravityLives || 3}
                                                onChange={(v) => updateSetting('gravityLives', v)}
                                                options={[
                                                    { label: '1 Heart', value: 1 },
                                                    { label: '3 Hearts', value: 3 },
                                                    { label: '5 Hearts', value: 5 }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Explosion FX"
                                    description="Show particle effects on hit."
                                    control={
                                        <Toggle
                                            checked={settings.explosionFX !== false}
                                            onChange={(v) => updateSetting('explosionFX', v)}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'Written':
                return (
                    <div className="space-y-6">
                        {renderDeckConfiguration()}
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Game Mode</h4>
                            <div className="space-y-1">
                                <SettingRow
                                    label="Mode"
                                    description="Choose your practice style."
                                    control={
                                        <div className="w-auto min-w-[300px]">
                                            <PillSelector
                                                value={settings.subMode || 'basic'}
                                                onChange={(v) => updateSetting('subMode', v)}
                                                options={[
                                                    { label: 'Standard', value: 'basic' },
                                                    { label: 'Word Reveal', value: 'word-reveal' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Input</h4>
                            <div className="space-y-1">
                                <SettingRow
                                    label="Answer With"
                                    description="Choose what you want to practice typing."
                                    control={
                                        <div className="w-auto min-w-[300px]">
                                            <PillSelector
                                                value={settings.questionFocus || 'term'}
                                                onChange={(v) => updateSetting('questionFocus', v)}
                                                options={[
                                                    { label: 'Terms', value: 'term' },
                                                    { label: 'Definitions', value: 'definition' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Grading Strictness"
                                    description="How precise must the spelling be?"
                                    control={
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">{settings.similarityThreshold || 85}%</span>
                                            <ColorSlider
                                                min={50}
                                                max={100}
                                                step={5}
                                                value={settings.similarityThreshold || 85}
                                                onChange={(v) => updateSetting('similarityThreshold', v)}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Instant Feedback"
                                    description="Show correct answers immediately after submission."
                                    control={
                                        <Toggle
                                            checked={settings.instantFeedback !== false}
                                            onChange={(v) => updateSetting('instantFeedback', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Timer Duration"
                                    description="Seconds allowed per question."
                                    control={
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">
                                                <AnimatedNumber value={settings.timer || 30} />s
                                            </span>
                                            <ColorSlider
                                                min={5}
                                                max={120}
                                                step={5}
                                                value={settings.timer || 30}
                                                onChange={(v) => updateSetting('timer', v)}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Ignore Case & Spaces"
                                    description="Be lenient with capitalization and whitespace."
                                    control={
                                        <Toggle
                                            checked={settings.autoSanitize !== false}
                                            onChange={(v) => updateSetting('autoSanitize', v)}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'Speaking Drill':
                return (
                    <div className="space-y-6">
                        {renderDeckConfiguration()}
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Voice</h4>
                            <div className="space-y-1">
                                <SettingRow
                                    label="Recording Limit"
                                    description="Maximum time allowed to speak each term."
                                    control={
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">
                                                <AnimatedNumber value={settings.timer === 15 ? 5 : Math.min(settings.timer || 5, 10)} />s
                                            </span>
                                            <ColorSlider
                                                min={1}
                                                max={10}
                                                step={1}
                                                value={settings.timer === 15 ? 5 : Math.min(settings.timer || 5, 10)}
                                                onChange={(v) => updateSetting('timer', v)}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Feedback Delivery"
                                    description="Receive results instantly or at the end of the session."
                                    control={
                                        <div className="w-auto min-w-[240px]">
                                            <PillSelector
                                                value={settings.feedbackMode || 'instant'}
                                                onChange={(v) => updateSetting('feedbackMode', v)}
                                                options={[
                                                    { label: 'Instant', value: 'instant' },
                                                    { label: 'End of Drill', value: 'test' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Attempt Logic"
                                    description="Choose how many tries you get per card."
                                    control={
                                        <div className="w-auto min-w-[300px]">
                                            <PillSelector
                                                value={settings.attemptLogic || 'one-and-done'}
                                                onChange={(v) => updateSetting('attemptLogic', v)}
                                                options={[
                                                    { label: 'One & Done', value: 'one-and-done' },
                                                    { label: '3 Strikes', value: '3-strikes' },
                                                    { label: 'Until Correct', value: 'until-correct' }
                                                ]}
                                            />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    label="Auto-Advance"
                                    description="Automatically move to the next card after success or failure."
                                    control={
                                        <Toggle
                                            checked={settings.autoAdvance !== false}
                                            onChange={(v) => updateSetting('autoAdvance', v)}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'Practice Test':
                return (
                    <div className="space-y-6">
                        {renderDeckConfiguration()}
                        <div className="space-y-1">
                            <SettingRow
                                label="Enable Timer"
                                description="Challenge yourself with a time limit."
                                control={
                                    <div className="flex flex-col items-end gap-3">
                                        <Toggle
                                            checked={settings.enableTimer !== false}
                                            onChange={(v) => updateSetting('enableTimer', v)}
                                        />
                                        {(settings.enableTimer !== false) && (
                                            <div className="flex items-center gap-4 animate-fade-in-up">
                                                <span className="text-sm font-mono font-bold text-[#0ea5e9] min-w-[3rem] text-right">
                                                    <AnimatedNumber value={settings.testLength || 30} />m
                                                </span>
                                                <ColorSlider
                                                    min={1}
                                                    max={120}
                                                    step={1}
                                                    value={settings.testLength || 30}
                                                    onChange={(v) => updateSetting('testLength', v)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                            <SettingRow
                                label="Answer With"
                                description="Test on Terms or Definitions."
                                control={
                                    <div className="w-auto min-w-[300px]">
                                        <PillSelector
                                            value={settings.answerFormat || 'term'}
                                            onChange={(v) => updateSetting('answerFormat', v)}
                                            options={[
                                                { label: 'Terms', value: 'term' },
                                                { label: 'Defs', value: 'definition' },
                                                { label: 'Both', value: 'both' }
                                            ]}
                                        />
                                    </div>
                                }
                            />
                        </div>

                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Question Types</h4>
                            <div className="space-y-1">
                                <SettingRow
                                    label="True / False"
                                    description="Speedy validation questions."
                                    control={
                                        <Toggle
                                            checked={settings.includeTF !== false}
                                            onChange={(v) => updateSetting('includeTF', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Multiple Choice"
                                    description="Standard 4-option questions."
                                    control={
                                        <Toggle
                                            checked={settings.includeMCQ !== false}
                                            onChange={(v) => updateSetting('includeMCQ', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Written"
                                    description="Type the exact answer."
                                    control={
                                        <Toggle
                                            checked={settings.includeWritten !== false}
                                            onChange={(v) => updateSetting('includeWritten', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Case Studies"
                                    description="Clinical scenario analysis."
                                    control={
                                        <Toggle
                                            checked={settings.includeCase !== false}
                                            onChange={(v) => updateSetting('includeCase', v)}
                                        />
                                    }
                                />
                                <SettingRow
                                    label="Matching"
                                    description="Connect terms to definitions."
                                    control={
                                        <Toggle
                                            checked={settings.includeMatching !== false}
                                            onChange={(v) => updateSetting('includeMatching', v)}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="p-8 text-center text-slate-500 font-medium">
                        No settings available for this mode.
                    </div>
                );
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/20 dark:bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white dark:bg-[#0c0c0d] dark:border dark:border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 pb-2 shrink-0 bg-white dark:bg-[#0c0c0d] z-20">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {mode}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[90%]">{description}</p>
                        </div>

                        {/* Settings List */}
                        <div className="flex-1 overflow-y-auto px-8 pb-6 scrollbar-hide">
                            <motion.div
                                className="py-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                            >
                                {renderSettings()}
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-4 shrink-0 bg-gradient-to-t from-white via-white to-white/0 dark:from-[#0c0c0d] dark:via-[#0c0c0d] dark:to-[#0c0c0d]/0 z-20">
                            <div className="btn-wrapper w-full">
                                <button onClick={onClose} className={`btn-custom ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'} w-full h-14 rounded-full text-lg shadow-xl`}>
                                    <span className="btn-text flex items-center justify-center gap-2 font-bold">
                                        Start Session
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
