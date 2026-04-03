import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ================================
// Types
// ================================

export interface FlashcardSettings {
    autoFlip: boolean;
    autoFlipDelay: number;     // seconds
    shuffle: boolean;
    smartSort: boolean;        // Prioritize learning/new cards
    favoritesOnly: boolean;
    showProgress: boolean;
    cardAnimation: 'flip' | 'slide' | 'fade';
}

export interface RapidFireSettings {
    timePerQuestion: number;   // seconds
    showTimer: boolean;
    shuffle: boolean;
    favoritesOnly: boolean;
    questionCount: number;     // 0 = all
    subMode: 'basic' | 'survival' | 'blitz';
}

export interface MatchingSettings {
    gridSize: 4 | 6 | 8;       // Number of pairs
    shuffle: boolean;
    favoritesOnly: boolean;
    showTimer: boolean;
    gravityRefill: boolean;    // Auto-refill board
}

export interface WrittenSettings {
    caseSensitive: boolean;
    allowPartialMatch: boolean;
    showHints: boolean;
    shuffle: boolean;
    favoritesOnly: boolean;
    answerWith: 'term' | 'definition' | 'both';
}

export interface SpeakingSettings {
    autoAdvance: boolean;
    recordingDuration: number; // seconds
    shuffle: boolean;
    favoritesOnly: boolean;
    showTranscript: boolean;
}

export interface TestSettings {
    questionTypes: {
        trueFalse: boolean;
        multipleChoice: boolean;
        written: boolean;
        caseStudy: boolean;
    };
    timeLimit: number;         // minutes, 0 = no limit
    shuffle: boolean;
    favoritesOnly: boolean;
    showAnswers: 'immediate' | 'end' | 'never';
    allowBacktracking: boolean;
}

export interface GlobalSettings {
    soundEffects: boolean;
    animations: boolean;
    hapticFeedback: boolean;
    autoSave: boolean;
    dailyGoal: number;         // cards per day
    reminderTime?: string;     // HH:mm format
    theme: 'light' | 'dark' | 'system';
}

export interface AllSettings {
    flashcards: FlashcardSettings;
    rapidFire: RapidFireSettings;
    matching: MatchingSettings;
    written: WrittenSettings;
    speaking: SpeakingSettings;
    test: TestSettings;
    global: GlobalSettings;
}

interface SettingsContextType {
    settings: AllSettings;
    updateFlashcardSettings: (updates: Partial<FlashcardSettings>) => void;
    updateRapidFireSettings: (updates: Partial<RapidFireSettings>) => void;
    updateMatchingSettings: (updates: Partial<MatchingSettings>) => void;
    updateWrittenSettings: (updates: Partial<WrittenSettings>) => void;
    updateSpeakingSettings: (updates: Partial<SpeakingSettings>) => void;
    updateTestSettings: (updates: Partial<TestSettings>) => void;
    updateGlobalSettings: (updates: Partial<GlobalSettings>) => void;
    resetToDefaults: () => void;
    resetModeToDefault: (mode: keyof Omit<AllSettings, 'global'>) => void;
}

// ================================
// Storage Key
// ================================

const SETTINGS_STORAGE_KEY = 'Viszmo_settings';

// ================================
// Default Settings
// ================================

const defaultSettings: AllSettings = {
    flashcards: {
        autoFlip: false,
        autoFlipDelay: 3,
        shuffle: false,
        smartSort: true,
        favoritesOnly: false,
        showProgress: true,
        cardAnimation: 'flip'
    },
    rapidFire: {
        timePerQuestion: 15,
        showTimer: true,
        shuffle: true,
        favoritesOnly: false,
        questionCount: 0,
        subMode: 'basic'
    },
    matching: {
        gridSize: 6,
        shuffle: true,
        favoritesOnly: false,
        showTimer: true,
        gravityRefill: true
    },
    written: {
        caseSensitive: false,
        allowPartialMatch: true,
        showHints: true,
        shuffle: true,
        favoritesOnly: false,
        answerWith: 'term'
    },
    speaking: {
        autoAdvance: false,
        recordingDuration: 10,
        shuffle: true,
        favoritesOnly: false,
        showTranscript: true
    },
    test: {
        questionTypes: {
            trueFalse: true,
            multipleChoice: true,
            written: true,
            caseStudy: true
        },
        timeLimit: 0,
        shuffle: true,
        favoritesOnly: false,
        showAnswers: 'end',
        allowBacktracking: true
    },
    global: {
        soundEffects: true,
        animations: true,
        hapticFeedback: true,
        autoSave: true,
        dailyGoal: 20,
        theme: 'system'
    }
};

// ================================
// Context
// ================================

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AllSettings>(() => {
        try {
            const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all fields exist
                return {
                    flashcards: { ...defaultSettings.flashcards, ...parsed.flashcards },
                    rapidFire: { ...defaultSettings.rapidFire, ...parsed.rapidFire },
                    matching: { ...defaultSettings.matching, ...parsed.matching },
                    written: { ...defaultSettings.written, ...parsed.written },
                    speaking: { ...defaultSettings.speaking, ...parsed.speaking },
                    test: {
                        ...defaultSettings.test,
                        ...parsed.test,
                        questionTypes: { ...defaultSettings.test.questionTypes, ...parsed.test?.questionTypes }
                    },
                    global: { ...defaultSettings.global, ...parsed.global }
                };
            }
        } catch (e) {
            console.warn('Failed to load settings from localStorage:', e);
        }
        return defaultSettings;
    });

    // Persist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings to localStorage:', e);
        }
    }, [settings]);

    // ================================
    // Update Functions
    // ================================

    const updateFlashcardSettings = (updates: Partial<FlashcardSettings>) => {
        setSettings(prev => ({
            ...prev,
            flashcards: { ...prev.flashcards, ...updates }
        }));
    };

    const updateRapidFireSettings = (updates: Partial<RapidFireSettings>) => {
        setSettings(prev => ({
            ...prev,
            rapidFire: { ...prev.rapidFire, ...updates }
        }));
    };

    const updateMatchingSettings = (updates: Partial<MatchingSettings>) => {
        setSettings(prev => ({
            ...prev,
            matching: { ...prev.matching, ...updates }
        }));
    };

    const updateWrittenSettings = (updates: Partial<WrittenSettings>) => {
        setSettings(prev => ({
            ...prev,
            written: { ...prev.written, ...updates }
        }));
    };

    const updateSpeakingSettings = (updates: Partial<SpeakingSettings>) => {
        setSettings(prev => ({
            ...prev,
            speaking: { ...prev.speaking, ...updates }
        }));
    };

    const updateTestSettings = (updates: Partial<TestSettings>) => {
        setSettings(prev => ({
            ...prev,
            test: { ...prev.test, ...updates }
        }));
    };

    const updateGlobalSettings = (updates: Partial<GlobalSettings>) => {
        setSettings(prev => ({
            ...prev,
            global: { ...prev.global, ...updates }
        }));
    };

    const resetToDefaults = () => {
        setSettings(defaultSettings);
    };

    const resetModeToDefault = (mode: keyof Omit<AllSettings, 'global'>) => {
        setSettings(prev => ({
            ...prev,
            [mode]: defaultSettings[mode]
        }));
    };

    // ================================
    // Provider
    // ================================

    return (
        <SettingsContext.Provider value={{
            settings,
            updateFlashcardSettings,
            updateRapidFireSettings,
            updateMatchingSettings,
            updateWrittenSettings,
            updateSpeakingSettings,
            updateTestSettings,
            updateGlobalSettings,
            resetToDefaults,
            resetModeToDefault
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
