import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';



export const InteractiveComparisonSlider = () => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const directionRef = useRef(1); // 1 = moving right, -1 = moving left
    const animationRef = useRef<number | null>(null);

    const handleMouseUp = () => setIsDragging(false);

    const handleMove = (clientX: number) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(percentage);
    };

    // Auto-animation logic
    useEffect(() => {
        const animate = () => {
            if (!isDragging && !isHovered) {
                setSliderPos(prev => {
                    const speed = 0.3; // Adjustment speed
                    let next = prev + (speed * directionRef.current);

                    if (next >= 85) {
                        directionRef.current = -1;
                        next = 85;
                    } else if (next <= 15) {
                        directionRef.current = 1;
                        next = 15;
                    }
                    return next;
                });
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isDragging, isHovered]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => handleMove(e.clientX);
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => handleMove(e.touches[0].clientX);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[280px] md:min-h-[400px] select-none rounded-3xl overflow-hidden border border-white group/slider shadow-[0_8px_30px_rgb(0,0,0,0.04)] touch-none bg-white cursor-ew-resize"
            onMouseMove={handleMouseMove}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
                setIsDragging(false);
                setIsHovered(false);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onTouchMove={handleTouchMove}
            onTouchStart={() => {
                setIsDragging(true);
                setIsHovered(true);
            }}
            onTouchEnd={() => {
                setIsDragging(false);
                setIsHovered(false);
            }}
        >
            {/* Right Side: Invisible to Others */}
            <div className="absolute inset-0 bg-[#F8FAFC]">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
                        backgroundSize: '10px 10px',
                    }}
                />

                <div className="absolute inset-0 p-4 md:p-8 flex flex-col items-center justify-center text-center">
                    <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-50/80 border border-red-100 text-red-500 text-[9px] md:text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 md:mb-4 whitespace-nowrap">
                        Invisible to others
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm font-medium">Hidden from screen share & recording</p>
                </div>
            </div>

            {/* Left Side: Visible to You */}
            <div
                className="absolute inset-0 bg-white border-r border-slate-100 z-10 overflow-hidden shadow-sm transition-[width] duration-75 ease-linear"
                style={{ width: `${sliderPos}%` }}
            >
                <div className="absolute inset-0 p-4 md:p-8 min-w-[300px] md:min-w-[500px] flex flex-col justify-center">
                    <div className="mb-3 md:mb-4 flex items-center gap-2">
                        <div className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-green-50 border border-green-100 text-green-600 text-[9px] md:text-[10px] sm:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            Visible to you
                        </div>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        <div className="h-3 md:h-4 bg-slate-100 rounded-full w-full"></div>
                        <div className="h-3 md:h-4 bg-slate-100 rounded-full w-5/6"></div>
                        <div className="h-3 md:h-4 bg-slate-100 rounded-full w-4/6"></div>
                        <div className="mt-4 md:mt-8 p-4 md:p-6 rounded-2xl bg-[#0ea5e9]/5 border border-[#0ea5e9]/10">
                            <h4 className="text-[#0ea5e9] text-xs md:text-sm font-bold mb-1 md:mb-2">Viszmo AI Assistant</h4>
                            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">According to the lecture notes, the primary cause of...</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Handle */}
            <div
                className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize drop-shadow-md transition-[left] duration-75 ease-linear"
                style={{ left: `${sliderPos}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center border border-slate-100 group-hover/slider:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
                    </svg>
                </div>
            </div>

            <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-none pointer-events-none"
            />
        </div>
    );
};

// Video Modal Component
const VideoModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                layoutId={`video-${src}`}
                className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <video
                    className="w-full h-full object-contain"
                    src={src}
                    autoPlay
                    loop
                    controls
                    playsInline
                />
            </motion.div>
        </motion.div>
    );
};

export const StudentLifeFeatures = () => {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <section className="py-24 md:py-32 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
                <div className="mb-16 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-left"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                            Three ways we make your <br />
                            <span className="text-[#0ea5e9]">Student Life better</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                            Viszmo enhances every part of your academic journey, from lectures to exams.
                        </p>
                    </motion.div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">

                    {/* FULL WIDTH: Seamless Privacy Integration */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="md:col-span-3 group relative rounded-[2rem] md:rounded-[3rem] overflow-hidden p-6 md:p-14 flex flex-col hover:shadow-xl transition-all duration-500"
                        style={{
                            // Matching the soft cool grey-blue aesthetic from typical SaaS "Cluely" style images
                            background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF4F9 100%)',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                    </motion.div>

                    {/* CARD 1: The Privacy Overlay */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="group relative rounded-[2rem] bg-[#fdfbf7] border border-slate-200 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1"
                    >
                        {/* Video Container */}
                        <div
                            className="relative pt-6 px-3 pb-0 z-10 cursor-pointer"
                            onClick={() => setSelectedVideo('/demoVids/AI Overlay Demo.mp4')}
                        >
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:shadow-xl group-hover:rounded-xl">
                                <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                        <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <video
                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                    src="/demoVids/AI Overlay Demo.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </div>
                        </div>

                        <div className="p-8 relative z-0">
                            {/* Paper Lines Background for Text Area */}
                            <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                    backgroundSize: '100% 100%'
                                }}
                            />

                            <div className="relative z-10">
                                <div className="trusted-pill-wrap mb-4 scale-90 origin-left">
                                    <div className="trusted-pill-shadow"></div>
                                    <div className="trusted-pill">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-pulse" />
                                        <span className="text-[#0ea5e9] text-[10px] font-bold uppercase tracking-widest leading-none">Privacy Mode</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Private Assistance</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    A floating overlay that instantly reads what's behind it. No copying, no switching tabs, 100% private.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARD 2: The Study Hub */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="group relative rounded-[2rem] bg-[#fdfbf7] border border-slate-200 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1"
                    >
                        {/* Video Container */}
                        <div
                            className="relative pt-6 px-3 pb-0 z-10 cursor-pointer"
                            onClick={() => setSelectedVideo('/demoVids/Study Mode Demo.mp4')}
                        >
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:shadow-xl group-hover:rounded-xl">
                                <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                        <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <video
                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                    src="/demoVids/Study Mode Demo.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </div>
                        </div>

                        <div className="p-8 relative z-0">
                            {/* Paper Lines Background for Text Area */}
                            <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                    backgroundSize: '100% 100%'
                                }}
                            />

                            <div className="relative z-10">
                                <div className="trusted-pill-wrap mb-4 scale-90 origin-left">
                                    <div className="trusted-pill-shadow"></div>
                                    <div className="trusted-pill">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                        <span className="text-violet-600 text-[10px] font-bold uppercase tracking-widest leading-none">Study Hub</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Auto-Pilot Guides</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Upload any PDF, link, or text. Viszmo instantly creates summaries, flashcards, quizzes, and test prep materials.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARD 3: Live Transcription */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="group relative rounded-[2rem] bg-[#fdfbf7] border border-slate-200 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1"
                    >
                        {/* Video Container */}
                        <div
                            className="relative pt-6 px-3 pb-0 z-10 cursor-pointer"
                            onClick={() => setSelectedVideo('/demoVids/Transcription AI Demo.mp4')}
                        >
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:shadow-xl group-hover:rounded-xl">
                                <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                        <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <video
                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                    src="/demoVids/Transcription AI Demo.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </div>
                        </div>

                        <div className="p-8 relative z-0">
                            {/* Paper Lines Background for Text Area */}
                            <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                    backgroundSize: '100% 100%'
                                }}
                            />

                            <div className="relative z-10">
                                <div className="trusted-pill-wrap mb-4 scale-90 origin-left">
                                    <div className="trusted-pill-shadow"></div>
                                    <div className="trusted-pill">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                        <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest leading-none">Transcription</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Record & Chat</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Transcribe lectures and videos in real-time. Ask the AI questions about the transcript instantly.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && <VideoModal src={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </section>
    );
};
