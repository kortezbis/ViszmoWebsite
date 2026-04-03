import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Move, Undo, Trash2, Minus, Plus, Eraser, ChevronLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';

interface Stroke {
    points: { x: number; y: number }[];
    color: string;
    width: number;
    type: 'pen' | 'eraser' | 'pan';
}

export function CanvasMode() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const navigate = useNavigate();
    const { setHideSidebar } = useSidebar();

    // Tools state
    const [tool, setTool] = useState<'pen' | 'eraser' | 'pan'>('pen');
    const [color, setColor] = useState('#000000'); // Will change init based on theme
    const brushSize = 4;

    // View state
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    // Interaction state
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Data state
    const [paths, setPaths] = useState<Stroke[]>([]);
    const [currentPath, setCurrentPath] = useState<{ x: number, y: number }[]>([]);

    // Theme colors
    const colors = [
        resolvedTheme === 'dark' ? '#ffffff' : '#000000',
        '#FF4F4F', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'
    ];

    // Initialize color based on theme if it's black/white
    useEffect(() => {
        if (color === '#000000' || color === '#ffffff') {
            setColor(resolvedTheme === 'dark' ? '#ffffff' : '#000000');
        }
    }, [resolvedTheme]);

    useEffect(() => {
        draw();
    }, [paths, pan, scale, currentPath, resolvedTheme]);

    const getWorldPos = (e: React.MouseEvent | MouseEvent) => {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: (e.clientX - rect.left - pan.x) / scale,
            y: (e.clientY - rect.top - pan.y) / scale
        };
    };

    const startInteraction = (e: React.MouseEvent) => {
        if (tool === 'pan' || e.button === 1 || e.buttons === 4) {
            setIsPanning(true);
            setLastPos({ x: e.clientX, y: e.clientY });
            return;
        }

        setIsDrawing(true);
        const pos = getWorldPos(e);
        setCurrentPath([{ x: pos.x, y: pos.y }]);
    };

    const moveInteraction = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastPos({ x: e.clientX, y: e.clientY });
            return;
        }

        if (isDrawing) {
            const pos = getWorldPos(e);
            setCurrentPath(prev => [...prev, { x: pos.x, y: pos.y }]);
        }
    };

    const endInteraction = () => {
        if (isPanning) setIsPanning(false);
        if (isDrawing) {
            setIsDrawing(false);
            if (currentPath.length > 0) {
                setPaths(prev => [...prev, { points: currentPath, color, width: brushSize, type: tool }]);
                setCurrentPath([]);
            }
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !wrapperRef.current) return;

        // Match canvas size to display size
        const rect = wrapperRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }

        // Clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(scale, scale);

        // Drawing settings
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const drawPath = (path: Stroke | { points: { x: number, y: number }[], color: string, width: number, type: string }) => {
            if (path.points.length < 1) return;

            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);

            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }

            ctx.lineWidth = path.width;

            if (path.type === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = path.color;
            }

            ctx.stroke();
            // Reset composite
            ctx.globalCompositeOperation = 'source-over';
        };

        // Draw saved paths
        paths.forEach(drawPath);

        // Draw current path
        if (currentPath.length > 0) {
            drawPath({ points: currentPath, color, width: brushSize, type: tool });
        }

        ctx.restore();
    };

    const handleBack = () => {
        setHideSidebar(false); // Ensure sidebar is shown when leaving
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col h-full w-full relative bg-background overflow-hidden">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBack}
                className="absolute top-6 left-6 z-40 p-2 bg-background-elevated border border-border rounded-xl shadow-lg hover:bg-surface-hover text-foreground-secondary transition-colors"
                title="Exit Canvas"
            >
                <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Toolbar */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-2 bg-background-elevated border border-border rounded-2xl shadow-xl"
            >
                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <button
                        onClick={() => setTool('pan')}
                        className={`p-2 rounded-xl transition-colors ${tool === 'pan' ? 'bg-brand-primary text-white' : 'hover:bg-surface-hover text-foreground-secondary'}`}
                        title="Pan Tool (Space + Drag)"
                    >
                        <Move className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-xl transition-colors ${tool === 'pen' ? 'bg-brand-primary text-white' : 'hover:bg-surface-hover text-foreground-secondary'}`}
                        title="Pen Tool"
                    >
                        <PenTool className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded-xl transition-colors ${tool === 'eraser' ? 'bg-brand-primary text-white' : 'hover:bg-surface-hover text-foreground-secondary'}`}
                        title="Eraser"
                    >
                        <Eraser className="w-5 h-5" />
                    </button>
                </div>

                {tool === 'pen' && (
                    <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-brand-primary scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                        className="p-2 rounded-xl hover:bg-surface-hover text-foreground-secondary"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="min-w-[3ch] text-xs font-bold text-center text-foreground-muted">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={() => setScale(s => Math.min(5, s + 0.1))}
                        className="p-2 rounded-xl hover:bg-surface-hover text-foreground-secondary"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="ml-2 pl-2 border-l border-border flex items-center gap-1">
                    <button
                        onClick={() => setPaths(prev => prev.slice(0, -1))}
                        className="p-2 rounded-xl hover:bg-surface-hover text-foreground-secondary"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setPaths([])}
                        className="p-2 rounded-xl hover:bg-red-500/10 text-red-500"
                        title="Clear Canvas"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Canvas Area */}
            <div
                ref={wrapperRef}
                className="flex-1 w-full relative overflow-hidden cursor-crosshair touch-none transition-colors duration-300"
                style={{
                    backgroundColor: resolvedTheme === 'dark' ? '#09090b' : '#f8fafc',
                    backgroundImage: `radial-gradient(${resolvedTheme === 'dark' ? '#27272a' : '#cbd5e1'} 1px, transparent 1px)`,
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                }}
                onMouseDown={startInteraction}
                onMouseMove={moveInteraction}
                onMouseUp={endInteraction}
                onMouseLeave={endInteraction}
            >
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                />
            </div>

            <div className="absolute bottom-6 right-6 text-xs text-foreground-muted font-medium bg-background/50 backdrop-blur px-3 py-1 rounded-full border border-border pointer-events-none">
                Canvas Mode • Scroll to Zoom • Middle Mouse to Pan
            </div>
        </div>
    );
}
