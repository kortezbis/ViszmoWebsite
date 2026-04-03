import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicOff, CheckCircle2, AlertCircle, ChevronRight, Mic, Square } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';


interface SpeakingGameProps {
    settings: {
        autoAdvance: boolean;
        questionFocus: 'term' | 'definition';
        enableTimer?: boolean;
        timer?: number;
        [key: string]: any;
    };
    cards: Array<{ term: string, definition: string, case?: string, id: number }>;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}



export function SpeakingGame({ settings, cards }: SpeakingGameProps) {
    const { resolvedTheme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'error' | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
    const [micError, setMicError] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [attempts, setAttempts] = useState(0);
    // Enforce 5s default if global settings is 15, and cap at 10s
    const maxTime = settings.timer === 15 ? 5 : Math.min(settings.timer || 5, 10);




    const recognitionRef = useRef<any>(null);

    const feedbackTimeoutRef = useRef<any>(null);
    const recordingTimerRef = useRef<any>(null);
    const countdownIntervalRef = useRef<any>(null);

    const currentItem = cards[currentIndex];
    // In the user's current deck/mapping, 'term' contains the definition and 'definition' contains the term.
    // Swapping these ensures the definition shows as the prompt and the term is expected as the answer.
    const prompt = currentItem.term;
    const answer = currentItem.definition;

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    }, []);

    const nextQuestion = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setFeedback(null);
            setTranscript('');
            setRecordingTime(0);
            setAttempts(0);
        } else {
            setGameState('gameover');
            stopListening();
        }
    }, [currentIndex, cards.length, settings.timer, stopListening]);

    const handleFailure = useCallback(() => {
        const nextAttempt = attempts + 1;
        setAttempts(nextAttempt);
        setFeedback('error');

        const logic = settings.attemptLogic || 'one-and-done';
        const shouldMoveOn =
            logic === 'one-and-done' ||
            (logic === '3-strikes' && nextAttempt >= 3);

        if (shouldMoveOn) {
            if (settings.autoAdvance !== false) {
                setTimeout(nextQuestion, settings.feedbackMode === 'test' ? 800 : 1500);
            }
        } else {
            // Allow retry
            setTimeout(() => {
                setFeedback(null);
                setTranscript('');
                setRecordingTime(0);
            }, 1000);
        }
    }, [attempts, settings.attemptLogic, settings.autoAdvance, settings.feedbackMode, nextQuestion]);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setMicError("Speech recognition is not supported in this browser.");
            return;
        }

        if (recognitionRef.current) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setRecordingTime(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= maxTime - 1) { // Reach the limit
                        stopListening();
                        handleFailure();
                        return maxTime;
                    }
                    return prev + 1;
                });
            }, 1000);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                setMicError("Microphone access denied.");
            }
            stopListening();
        };

        recognition.onend = () => {
            stopListening();
        };

        recognition.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }

            setTranscript(currentTranscript.toLowerCase());

            // Keyword Matching
            const normalizedAnswer = answer.toLowerCase().trim();
            if (currentTranscript.toLowerCase().includes(normalizedAnswer)) {
                setCorrectCount(prev => prev + 1);
                setFeedback('correct');
                stopListening();
                // Always auto-advance on success for smoothness
                if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
                feedbackTimeoutRef.current = setTimeout(nextQuestion, settings.feedbackMode === 'test' ? 800 : 1200);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [answer, settings.autoAdvance, nextQuestion, stopListening, handleFailure, maxTime]);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    useEffect(() => {
        if (gameState !== 'playing' || !settings.enableTimer) return;

        if (settings.autoAdvance === false) return; // Only run countdown for auto-advance

        let localTimeLeft = maxTime;
        countdownIntervalRef.current = setInterval(() => {
            if (localTimeLeft <= 1) {
                if (!feedback) {
                    stopListening();
                    handleFailure();
                    setTranscript(settings.feedbackMode === 'test' ? "Recorded" : "Keep trying...");
                }
                clearInterval(countdownIntervalRef.current);
                return;
            }
            localTimeLeft -= 1;
        }, 1000);

        return () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [currentIndex, gameState, settings.enableTimer, settings.autoAdvance, nextQuestion, stopListening]);

    useEffect(() => {
        return () => {
            stopListening();
            if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [stopListening]);

    const handleRetry = () => {
        setCurrentIndex(0);
        setGameState('playing');
        setFeedback(null);
        setCorrectCount(0);
        setTranscript('');
        setMicError(null);
        setRecordingTime(0);
    };

    if (gameState === 'gameover') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background overflow-hidden">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center w-full max-w-4xl">
                    <div className="text-center shrink-0">
                        <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">Drill Complete</h2>
                        <p className="text-foreground-secondary mb-6 text-sm">All concepts articulated successfully</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-sm mx-auto w-full">
                        <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-brand-primary">{correctCount}</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-2">Terms Correct</span>
                        </div>
                        <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-foreground-muted">{cards.length}</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-2">Total Terms</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto w-full shrink-0">
                        <div className="btn-wrapper w-full">
                            <button onClick={handleRetry} className={`btn-custom ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'} w-full h-14 rounded-full text-lg shadow-xl`}>
                                <span className="btn-text font-bold uppercase tracking-wider">Restart Drill</span>
                            </button>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="text-foreground-secondary hover:text-foreground font-medium py-2"
                        >
                            Return to Course
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }
    return (
        <div className={`flex-1 flex flex-col items-center transition-all duration-700 relative overflow-y-auto ${feedback === 'correct' ? 'bg-success/5' : 'bg-background'}`}>
            <div className="w-full max-w-5xl flex flex-col items-center py-20 px-6 relative">

                {/* Status Bar */}

                <div className="w-full flex items-center justify-between mb-16">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-error animate-pulse' : 'bg-foreground-muted'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isListening ? 'text-error' : 'text-foreground-muted'}`}>
                            {isListening ? `Recording... ${maxTime - recordingTime}s` : `Limit: ${maxTime}s • Tap to speak`}
                        </span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-tighter text-foreground-muted mb-0.5">Attempt</div>
                            <div className="text-lg font-black tabular-nums">
                                {settings.attemptLogic === '3-strikes' ? (
                                    <span className="flex gap-1 justify-end mt-1.5 px-0.5">
                                        {[1, 2, 3].map(s => (
                                            <div key={s} className={`w-2 h-2 rounded-full transition-colors duration-300 ${attempts >= s ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-surface-active border border-border'}`} />
                                        ))}
                                    </span>
                                ) : settings.attemptLogic === 'until-correct' ? (
                                    <span className="text-brand-primary">#{attempts + 1}</span>
                                ) : (
                                    <span className="text-foreground-muted/50 font-medium text-sm italic">Standard</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-tighter text-foreground-muted mb-0.5 whitespace-nowrap">Progress</div>
                            <div className="text-lg font-black tabular-nums">
                                <span className="text-brand-primary">{currentIndex + 1}</span>
                                <span className="text-foreground-muted/30 mx-1">/</span>
                                <span className="text-foreground-secondary">{cards.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.05, opacity: 0 }}
                        className="text-center mb-16 px-4"
                    >
                        <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-8 max-w-4xl mx-auto">
                            {prompt}
                        </h3>

                        {currentItem.case && (
                            <div className="flex items-center gap-3 bg-surface-active p-4 rounded-2xl border border-border border-dashed max-w-lg mx-auto">
                                <AlertCircle className="w-5 h-5 text-brand-primary shrink-0" />
                                <p className="text-sm font-medium text-foreground-secondary text-left italic">
                                    "{currentItem.case}"
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* New Liquid Speak Button */}
                <div className="relative mb-8 pt-4">
                    <AnimatePresence>
                        {isListening && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.15, 0.3] }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-brand-primary/20 rounded-full blur-2xl z-0"
                            />
                        )}
                    </AnimatePresence>

                    <button
                        onClick={toggleListening}
                        disabled={!!feedback}
                        className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 group shadow-2xl ${isListening
                            ? 'scale-110'
                            : 'btn-upgrade'
                            } ${feedback ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105'}`}
                        style={isListening ? {
                            background: 'radial-gradient(115% 115% at 10% 20%, #ef4444 0%, #991b1b 100%)',
                            boxShadow: 'inset -3px -3px 4px rgba(239, 68, 68, 0.4), inset 3px 3px 4px rgba(255, 255, 255, 0.2), 0 10px 20px rgba(239, 68, 68, 0.2)'
                        } : {}}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                                className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                            />
                        </div>

                        {isListening ? (
                            <Square className="w-9 h-9 text-white relative z-10" />
                        ) : (
                            <Mic className="w-10 h-10 relative z-10 text-white" />
                        )}
                    </button>

                    <p className={`text-center text-[10px] font-black uppercase tracking-widest mt-6 transition-colors duration-300 ${isListening ? 'text-error animate-pulse' : 'text-foreground-muted'}`}>
                        {isListening ? 'Stop Recording' : 'Tap to speak'}
                    </p>
                </div>

                {/* Modern Audio Visualizer (Waveform) */}
                <div className="w-full flex items-center justify-center h-16 gap-1.5 mb-8">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: isListening && !feedback
                                    ? [4, Math.sin((i / 4.8) + (recordingTime * 2)) * 30 + 34, 4]
                                    : [2, Math.random() * 4 + 2, 2],
                                opacity: isListening ? [0.4, 1, 0.4] : 0.2
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.6 + (i * 0.01),
                                ease: "easeInOut"
                            }}
                            className={`w-0.5 rounded-full transition-colors duration-500 ${feedback === 'correct' ? 'bg-success' : 'bg-brand-primary'
                                }`}
                        />
                    ))}
                </div>

                {/* Transcription Display */}
                <div className="w-full min-h-[4rem] text-center">
                    <p className={`text-lg font-bold transition-all duration-300 ${feedback === 'correct' ? (settings.feedbackMode === 'test' ? 'text-brand-primary' : 'text-success scale-110') :
                        feedback === 'error' ? (settings.feedbackMode === 'test' ? 'text-brand-primary' : 'text-error scale-95') :
                            'text-foreground-secondary'
                        }`}>
                        {feedback === 'correct' ? (
                            <span className="flex items-center justify-center gap-2">
                                {settings.feedbackMode === 'test' ? (
                                    <>Answer Recorded</>
                                ) : (
                                    <><CheckCircle2 className="w-6 h-6" /> Got it! {answer}</>
                                )}
                            </span>
                        ) : feedback === 'error' ? (
                            <span className="flex items-center justify-center gap-2">
                                {settings.feedbackMode === 'test' ? (
                                    <>Answer Recorded</>
                                ) : (
                                    <><MicOff className="w-6 h-6" /> Missed it: {answer}</>
                                )}
                            </span>
                        ) : transcript || "Speak the term..."}
                    </p>
                </div>


                {/* Next Button */}
                {!settings.autoAdvance && feedback && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mt-8 btn-wrapper"
                    >
                        <button onClick={nextQuestion} className={`btn-custom ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'} px-10 h-14 rounded-full text-lg shadow-xl min-w-[200px]`}>
                            <span className="btn-text flex items-center justify-center gap-2 font-bold uppercase tracking-wider">
                                Continue <ChevronRight className="w-5 h-5" />
                            </span>
                        </button>
                    </motion.div>
                )}

                {/* Error State */}
                {micError && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-8 text-center">
                        <div className="max-w-sm">
                            <MicOff className="w-16 h-16 text-error mx-auto mb-6" />
                            <h4 className="text-xl font-bold mb-2">Microphone Error</h4>
                            <p className="text-foreground-secondary mb-8">{micError}</p>
                            <button onClick={() => window.location.reload()} className="btn-secondary w-full py-4 rounded-xl font-bold">
                                Refresh Browser
                            </button>
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
}
