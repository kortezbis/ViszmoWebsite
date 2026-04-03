import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchGameProps {
    settings: {
        matchDepth: '2-way' | '3-way';
        soundEffects: boolean;
        gravityLoop?: boolean; // Enable gravity refill
        [key: string]: any;
    };
    cards: Array<{ term: string, definition: string, case?: string, id: number }>;
}

interface Tile {
    id: string;
    content: string;
    matchId: number; // Index in cards
    type: 'term' | 'definition' | 'case';
    isMatched: boolean;
    isNew?: boolean; // For drop-in animation
}

export function MatchGame({ settings, cards }: MatchGameProps) {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [cardQueue, setCardQueue] = useState<typeof cards>([]); // Queue for gravity refill
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'counting' | 'playing' | 'gameover'>('counting');
    const [countdown, setCountdown] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [finalTime, setFinalTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [mismatchIds, setMismatchIds] = useState<string[]>([]);
    const [isLocked, setIsLocked] = useState(false);
    const [textOpacity, setTextOpacity] = useState(1);
    const [matchedCount, setMatchedCount] = useState(0); // Total matches made
    const lastInteractionRef = useRef<number>(Date.now());
    const matchIdCounter = useRef(0); // Unique match ID counter

    const timerIntervalRef = useRef<any>(null);


    // Helper to create tiles from a card item
    const createTilesFromItem = useCallback((item: typeof cards[0], matchId: number, is3Way: boolean): Tile[] => {
        const tileset: Tile[] = [
            { id: `term-${matchId}-${Date.now()}`, content: item.term, matchId, type: 'term', isMatched: false, isNew: true },
            { id: `def-${matchId}-${Date.now()}`, content: item.definition, matchId, type: 'definition', isMatched: false, isNew: true }
        ];
        if (is3Way) {
            tileset.push({ id: `case-${matchId}-${Date.now()}`, content: item.case || '', matchId, type: 'case', isMatched: false, isNew: true });
        }
        return tileset;
    }, []);

    const initGame = useCallback(() => {
        const is3Way = settings.matchDepth === '3-way';
        // Grid layout: 2-way = 6 pairs (12 tiles), 3-way = 4 triples (12 tiles)
        const tilesPerRound = is3Way ? 4 : 6;

        // Shuffle the full deck
        const shuffledDeck = [...cards].sort(() => Math.random() - 0.5);

        // Initial tiles for the board
        const initialItems = shuffledDeck.slice(0, tilesPerRound);
        // Queue for gravity refill (remaining cards)
        const queueItems = settings.gravityLoop ? shuffledDeck.slice(tilesPerRound) : [];

        matchIdCounter.current = 0;
        const newTiles: Tile[] = [];
        initialItems.forEach((item) => {
            const matchId = matchIdCounter.current++;
            newTiles.push(...createTilesFromItem(item, matchId, is3Way));
        });

        setTiles(newTiles.sort(() => Math.random() - 0.5));
        setCardQueue(queueItems);
        setMatchedCount(0);
        setGameState('counting');
        setCountdown(3);
        setSelectedIds([]);
        setMismatchIds([]);
        setIsLocked(false);
        setTextOpacity(1);

        setElapsedTime(0);
        lastInteractionRef.current = Date.now();
    }, [settings.matchDepth, settings.gravityLoop, cards, createTilesFromItem]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    // Countdown logic
    useEffect(() => {
        if (gameState === 'counting') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('playing');
                setStartTime(Date.now());
            }
        }
    }, [gameState, countdown]);

    // Stopwatch Logic
    useEffect(() => {
        if (gameState === 'playing') {
            timerIntervalRef.current = setInterval(() => {
                setElapsedTime((Date.now() - startTime) / 1000);
            }, 100);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [gameState, startTime]);

    // Text Decay Logic - Disabled by default, only active if explicitly set
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceInteraction = now - lastInteractionRef.current;

            if (settings.decaySpeed === 'normal') {
                // Wait 10s then fade slowly
                if (timeSinceInteraction > 10000) {
                    setTextOpacity(prev => Math.max(0, prev - 0.01));
                } else {
                    setTextOpacity(1);
                }
            } else if (settings.decaySpeed === 'instant') {
                // Wait 5s then fade quickly
                if (timeSinceInteraction > 5000) {
                    setTextOpacity(prev => Math.max(0, prev - 0.02));
                } else {
                    setTextOpacity(1);
                }
            } else {
                // OFF (default) - keep text visible
                setTextOpacity(1);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [gameState, settings.decaySpeed]);

    const handleTileClick = (id: string) => {
        if (isLocked || gameState !== 'playing') return;

        // If clicking a new tile while others are showing red (mismatched), clear error immediately
        if (mismatchIds.length > 0) {
            setMismatchIds([]);
            setSelectedIds([]);
        }

        const tile = tiles.find(t => t.id === id);
        if (!tile || tile.isMatched) return;

        // Deselect if already selected
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(sId => sId !== id));
            return;
        }

        const newSelection = [...selectedIds, id];
        setSelectedIds(newSelection);

        // Reset interaction timer on click
        lastInteractionRef.current = Date.now();
        if (settings.decaySpeed === 'instant') {
            setTextOpacity(1);
        }

        const is3Way = settings.matchDepth === '3-way';
        const requiredCount = is3Way ? 3 : 2;

        if (newSelection.length === requiredCount) {
            const selectedTiles = newSelection.map(sId => tiles.find(t => t.id === sId)!);
            const firstMatchId = selectedTiles[0].matchId;
            const isMatch = selectedTiles.every(t => t.matchId === firstMatchId);

            if (isMatch) {
                // Match Found!
                setMatchedCount(prev => prev + 1);

                setTimeout(() => {
                    // Remove matched tiles
                    setTiles(prev => prev.filter(t => !newSelection.includes(t.id)));
                    setSelectedIds([]);
                    setTextOpacity(1);

                    // Gravity Refill: Add new tiles from queue
                    if (settings.gravityLoop && cardQueue.length > 0) {
                        const nextItem = cardQueue[0];
                        const newMatchId = matchIdCounter.current++;
                        const newTiles = createTilesFromItem(nextItem, newMatchId, is3Way);

                        // Add new tiles with slight delay for "drop-in" effect
                        setTimeout(() => {
                            setTiles(prev => [...prev, ...newTiles].sort(() => Math.random() - 0.5));
                            // Clear isNew flag after animation
                            setTimeout(() => {
                                setTiles(prev => prev.map(t => ({ ...t, isNew: false })));
                            }, 400);
                        }, 200);

                        // Remove from queue
                        setCardQueue(prev => prev.slice(1));
                    }
                }, 300);
            } else {
                // Mismatch - show error
                setMismatchIds(newSelection);

                setTimeout(() => {
                    setMismatchIds([]);
                    setSelectedIds([]);
                }, 600);
            }
        }
    };

    // Game Over Check: All tiles matched AND queue is empty
    useEffect(() => {
        if (gameState === 'playing' && tiles.length === 0 && cardQueue.length === 0) {
            setGameState('gameover');
            setFinalTime((Date.now() - startTime) / 1000);
        }
    }, [tiles.length, cardQueue.length, gameState, startTime]);

    if (gameState === 'counting') {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-9xl font-black text-brand-primary"
                >
                    {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
            </div>
        );
    }

    if (gameState === 'gameover') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background overflow-hidden">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center w-full max-w-4xl"
                >
                    <div className="text-center shrink-0">
                        <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">Perfect Match!</h2>
                        <p className="text-foreground-secondary mb-6 text-sm">All concepts matched successfully</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto w-full">
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-brand-primary tabular-nums">{finalTime.toFixed(1)}s</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider mt-1">Total Time</span>
                        </div>
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-green-500 tabular-nums">{matchedCount}</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider mt-1">Total Matches</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 max-w-xs mx-auto w-full shrink-0">
                        <div className="btn-wrapper w-full">
                            <button onClick={initGame} className="btn-premium w-full">
                                <span className="btn-text">Play Again</span>
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden select-none">
            {/* Decay Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-surface-active overflow-hidden">
                <motion.div
                    className="h-full bg-brand-primary"
                    initial={{ width: "100%" }}
                    animate={{ width: `${textOpacity * 100}%` }}
                    transition={{ ease: "linear", duration: 0.5 }}
                />
            </div>

            {/* Timer Display */}
            <div className="w-full max-w-[1400px] mb-8 flex items-center justify-center">
                <span className="text-4xl font-black text-brand-primary tabular-nums tracking-tight font-mono">
                    {elapsedTime.toFixed(1)}s
                </span>

            </div>

            {/* Match Grid */}
            <div
                className={`grid gap-6 w-full max-w-[1400px] grid-cols-2 md:grid-cols-4`}
            >
                <AnimatePresence mode="popLayout">
                    {tiles.map((tile) => {
                        const isSelected = selectedIds.includes(tile.id);
                        const isMismatch = mismatchIds.includes(tile.id);

                        return (
                            <motion.button
                                key={tile.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                animate={{
                                    opacity: tile.isMatched ? 0 : 1,
                                    scale: tile.isMatched ? 0.95 : 1,
                                    y: tile.isMatched ? 10 : 0,
                                    x: isMismatch ? [0, -4, 4, -4, 4, 0] : 0,
                                    rotate: isMismatch ? [0, -1, 1, -1, 1, 0] : 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                    mass: 1,
                                    opacity: { duration: 0.2 },
                                    scale: { duration: 0.2 },
                                    y: { type: "spring", stiffness: 300, damping: 25 },
                                    layout: { type: "spring", stiffness: 300, damping: 30 },
                                    x: { duration: 0.4 },
                                    rotate: { duration: 0.4 }
                                }}
                                whileHover={!tile.isMatched && !isLocked ? { scale: 1.02, y: -2 } : {}}
                                whileTap={!tile.isMatched && !isLocked ? { scale: 0.98 } : {}}
                                onClick={() => handleTileClick(tile.id)}
                                className={`
                                    relative min-h-[180px] aspect-[4/3] flex items-center justify-center p-6 rounded-3xl border-2
                                    ${tile.isMatched ? 'pointer-events-none' : ''}
                                    ${isSelected ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-95 z-10 transition-colors' :
                                        isMismatch ? 'bg-error border-error text-white z-20 transition-colors' :
                                            'bg-background-elevated border-border-strong hover:border-brand-primary hover:shadow-xl transition-all duration-200'}
                                `}
                            >
                                <motion.span
                                    style={{ opacity: isSelected || isMismatch ? 1 : textOpacity }}
                                    className="text-lg font-bold text-center break-words line-clamp-5 transition-opacity duration-500"
                                >
                                    {tile.content}
                                </motion.span>


                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>


    );
}
