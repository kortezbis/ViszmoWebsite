
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useState } from 'react';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { motion } from 'framer-motion';
import {
    Mic, BookOpen, Laptop, CheckCircle2,
    MousePointer2, Keyboard, Eye, Layers, RefreshCw, Monitor,
    FileText, List, MessageSquare,
    FileInput, Link, ClipboardCopy, Music, Zap
} from 'lucide-react';

// --- Reusable Components ---

const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: "blue" | "indigo" | "violet" | "emerald" }) => {
    const colorStyles = {
        blue: "text-[#0ea5e9] shadow-[inset_0_-2px_2px_rgba(14,165,233,0.1)]",
        indigo: "text-indigo-600 shadow-[inset_0_-2px_2px_rgba(79,70,229,0.1)]",
        violet: "text-violet-600 shadow-[inset_0_-2px_2px_rgba(124,58,237,0.1)]",
        emerald: "text-emerald-600 shadow-[inset_0_-2px_2px_rgba(5,150,105,0.1)]",
    };

    return (
        <span className={`inline-block px-4 py-1.5 mb-6 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest backdrop-blur-md bg-white/40 border border-white/60 shadow-sm ${colorStyles[color]}`}>
            {children}
        </span>
    );
};

const VideoContainer = ({ src, children, overlay }: { src: string, children?: React.ReactNode, overlay?: React.ReactNode }) => (
    <div className="relative group w-full">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
            <div className="absolute inset-0 bg-slate-900/5 z-10 pointer-events-none group-hover:bg-transparent transition-colors" />
            <video
                className="w-full h-full object-cover"
                src={src}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
            />
            {overlay}
        </div>
        {children}
    </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-colors">
        <Icon className="w-5 h-5 text-[#0ea5e9] mb-3" />
        <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
);

const FeatureListItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
        <Icon className="w-4 h-4 text-slate-400" />
        <span>{text}</span>
    </li>
);


export const FeaturesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);


    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#0ea5e9]/10 overflow-x-hidden">
            <Navbar onOpenModal={() => setIsModalOpen(true)} />

            <main className="flex-1 relative">
                {/* Background (Shared) */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
                    <div className="absolute inset-0 bg-[#ffffff]" />
                    <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                </div>


                {/* Hero Title Only */}
                <section className="pt-40 pb-12 text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900">
                            Features & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-indigo-500">Tech Specs</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            A deep dive into the most advanced study assistant ever built for Windows.
                        </p>
                    </motion.div>
                </section>

                <div className="max-w-[85rem] mx-auto px-4 space-y-16 pb-32">

                    {/* --- SECTION 1: INVISIBLE AI ASSISTANCE --- */}
                    <div className="bg-[#fdfbf7] rounded-[2.5rem] border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-16 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        {/* Paper Lines Background */}
                        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                backgroundSize: '100% 100%'
                            }}
                        />
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-50 rounded-full blur-[100px] -z-10 opacity-60" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
                            {/* Video Side (Left) */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <VideoContainer
                                    src="https://www.Viszmo.com/assets/AI%20Overlay%20Demo.mp4"
                                    overlay={
                                        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-slate-200/50 w-44 z-20">
                                            <div className="text-[10px] font-black tracking-wider uppercase mb-4 text-slate-400">System Metrics</div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-600">Latency</span>
                                                    <span className="text-xs font-black text-emerald-500">&lt;50ms</span>
                                                </div>
                                                <div className="h-px bg-slate-100"></div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-600">Encryption</span>
                                                    <span className="text-xs font-black text-[#0ea5e9]">AES-256</span>
                                                </div>
                                                <div className="h-px bg-slate-100"></div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-600">Resolution</span>
                                                    <span className="text-xs font-black text-violet-500">Up to 4K</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                />
                                {/* Decorative element behind */}
                                <div className="absolute -inset-4 bg-gradient-to-tr from-sky-100 to-transparent -z-10 rounded-[3rem] blur-2xl opacity-50" />
                            </motion.div>

                            {/* Text Side (Right) */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <Badge color="blue">The Privacy Overlay</Badge>
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                    Private AI <br /> Assistance.
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                                    Position the floating overlay anywhere on your screen. Viszmo instantly reads what's behind it. No copying, no switching tabs, 100% private.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                    <FeatureCard
                                        icon={MousePointer2}
                                        title="Click-Through Mode"
                                        description="Interact with windows behind the overlay without moving it. Perfect for focused study sessions."
                                    />
                                    <FeatureCard
                                        icon={Keyboard}
                                        title="Keyboard First"
                                        description="Full control via shortcuts. Ctrl+Shift+Q to scan instantly without clicking."
                                    />
                                </div>

                                <ul className="space-y-4">
                                    <FeatureListItem icon={MessageSquare} text="Chat with Screen — Ask follow-up questions about what you see" />
                                    <FeatureListItem icon={Eye} text="Privacy Mode — Instantly hide from screen capture" />
                                    <FeatureListItem icon={Layers} text="Multi-Image Context — Chain multiple screenshots" />
                                    <FeatureListItem icon={RefreshCw} text="Auto-Capture — Hands-free scanning every 30s" />
                                    <FeatureListItem icon={Monitor} text="Multi-Monitor — Select any display target" />
                                </ul>
                            </motion.div>

                        </div>
                    </div>

                    {/* --- SECTION 2: LIVE TRANSCRIPTION --- */}
                    <div className="bg-[#fdfbf7] rounded-[2.5rem] border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-16 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        {/* Paper Lines Background */}
                        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                backgroundSize: '100% 100%'
                            }}
                        />
                        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] -z-10 opacity-60" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">

                            {/* Text Side (Left) */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-1"
                            >
                                <Badge color="emerald">Live Transcription</Badge>
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                    Record Anything, <br /> Chat With AI.
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                                    Transcribe lectures, meetings, podcasts, YouTube videos, and conversations in real-time. Then ask AI questions about your transcript, get summaries, key points, and more.
                                </p>

                                <div className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-100 mb-8">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 block">Post-Processing Tools</span>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                                                <FileText className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">Smart Summaries</h4>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Auto-generated concise overviews of long recordings.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                                                <List className="w-5 h-5 text-violet-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">Key Points & Actions</h4>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Extracts actionable items and crucial definitions.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                                                <MessageSquare className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">Contextual Chat</h4>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Ask "What did the professor say about X?" and get instant citations.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    Auto-Paragraphing
                                </div>
                            </motion.div>

                            {/* Video Side (Right) */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-2 relative"
                            >
                                <VideoContainer src="https://www.Viszmo.com/assets/Transcription%20AI%20Demo.mp4">
                                    {/* Bottom Icons Bar */}
                                    <div className="mt-8 bg-white/80 backdrop-blur-md border border-slate-100/60 rounded-2xl p-6 shadow-sm flex justify-between items-center text-center">
                                        <div className="flex-1 border-r border-slate-200/50 last:border-0 px-2">
                                            <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                                                <Mic className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Microphone</div>
                                            <div className="text-[10px] text-slate-400 mt-1">Lectures & In-Person</div>
                                        </div>
                                        <div className="flex-1 border-r border-slate-200/50 last:border-0 px-2">
                                            <div className="w-10 h-10 mx-auto bg-violet-50 rounded-full flex items-center justify-center mb-2">
                                                <Monitor className="w-5 h-5 text-violet-500" />
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Audio</div>
                                            <div className="text-[10px] text-slate-400 mt-1">Meetings & Videos</div>
                                        </div>
                                        <div className="flex-1 px-2">
                                            <div className="w-10 h-10 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                                                <Zap className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hybrid Mode</div>
                                            <div className="text-[10px] text-slate-400 mt-1">Record Both Inputs</div>
                                        </div>
                                    </div>
                                </VideoContainer>
                                {/* Decorative element behind */}
                                <div className="absolute -inset-4 bg-gradient-to-tl from-indigo-100 to-transparent -z-10 rounded-[3rem] blur-2xl opacity-50" />
                            </motion.div>
                        </div>
                    </div>

                    {/* --- SECTION 3: STUDY HUB --- */}
                    <div className="bg-[#fdfbf7] rounded-[2.5rem] border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-16 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        {/* Paper Lines Background */}
                        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                backgroundSize: '100% 100%'
                            }}
                        />
                        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-50 rounded-full blur-[100px] -z-10 opacity-60" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">

                            {/* Video Side (Left) */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <VideoContainer src="https://www.Viszmo.com/assets/Study%20Mode%20Demo.mp4">
                                    {/* Bottom Icons Bar */}
                                    <div className="mt-8 bg-white/80 backdrop-blur-md border border-slate-100/60 rounded-2xl p-6 shadow-sm flex justify-between items-center text-center">
                                        <div className="flex-1 border-r border-slate-200/50 last:border-0 px-2 group/icon cursor-pointer">
                                            <FileInput className="w-6 h-6 mx-auto text-slate-400 group-hover/icon:text-[#0ea5e9] transition-colors mb-2" />
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Uploads</div>
                                            <div className="text-[10px] text-slate-300">PDF, IMG</div>
                                        </div>
                                        <div className="flex-1 border-r border-slate-200/50 last:border-0 px-2 group/icon cursor-pointer">
                                            <Link className="w-6 h-6 mx-auto text-slate-400 group-hover/icon:text-[#0ea5e9] transition-colors mb-2" />
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bridge</div>
                                            <div className="text-[10px] text-slate-300">URL Fetch</div>
                                        </div>
                                        <div className="flex-1 border-r border-slate-200/50 last:border-0 px-2 group/icon cursor-pointer">
                                            <ClipboardCopy className="w-6 h-6 mx-auto text-slate-400 group-hover/icon:text-[#0ea5e9] transition-colors mb-2" />
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paste</div>
                                            <div className="text-[10px] text-slate-300">Direct</div>
                                        </div>
                                        <div className="flex-1 px-2 group/icon cursor-pointer">
                                            <Music className="w-6 h-6 mx-auto text-slate-400 group-hover/icon:text-[#0ea5e9] transition-colors mb-2" />
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audio</div>
                                            <div className="text-[10px] text-slate-300">Saved</div>
                                        </div>
                                    </div>
                                </VideoContainer>
                                {/* Decorative element behind */}
                                <div className="absolute -inset-4 bg-gradient-to-tr from-violet-100 to-transparent -z-10 rounded-[3rem] blur-2xl opacity-50" />
                            </motion.div>

                            {/* Text Side (Right) */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <Badge color="violet">The Study Hub</Badge>
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                    Study Guides, <br /> On Auto-Pilot.
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                                    Upload PDFs, paste YouTube links, text snippets, or use transcripts. Turn anything into summaries, flashcards, quizzes, key terms, study guides, and test prep instantly.
                                </p>

                                {/* Feature Pills */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { icon: FileText, label: "Detailed Summary" },
                                        { icon: CheckCircle2, label: "25-Question Quiz" },
                                        { icon: Layers, label: "30 Flashcards" },
                                        { icon: BookOpen, label: "Comprehensive Guide" },
                                        { icon: Laptop, label: "Practice Test (35 Qs)" },
                                        { icon: Zap, label: "Key Terms Extraction" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all cursor-default">
                                            <item.icon className="w-4 h-4 text-[#0ea5e9]" />
                                            <span className="text-[10px] sm:text-xs font-bold text-slate-600 whitespace-nowrap">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>


                        </div>
                    </div>
                </div>

                {/* Final CTA Section */}
                <section className="py-24 md:py-32 px-4 relative z-10 bg-transparent">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 tracking-tight px-4 text-slate-900"
                        >
                            Ready to see <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-indigo-400">for yourself?</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-base md:text-lg text-slate-500 mb-10 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
                        >
                            Join thousands of students using Viszmo to study smarter. Download now and get started for free.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="btn-wrapper">
                                    <button
                                        className="btn"
                                        tabIndex={0}
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30" fill="currentColor">
                                            <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                                        </svg>
                                        <span className="btn-text">Coming Soon</span>
                                    </button>
                                </div>

                                <div className="explore-btn-wrap" onClick={() => window.location.href = '/pricing'}>
                                    <div className="explore-btn-shadow"></div>
                                    <button className="explore-btn">
                                        <span>Explore Pricing</span>
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">
                                WINDOWS 10 & 11 • PRIVATE • SECURE
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Bottom Fade Wrapper - Identical to App.tsx */}
                <div className="relative isolate mt-auto">
                    <div
                        className="absolute inset-0 -z-20 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                            backgroundSize: '24px 24px',
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)',
                            height: '100%',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            position: 'absolute'
                        }}
                    />
                    {/* Bottom Fade into Footer Color */}
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#d6dee8] -z-10 pointer-events-none" />
                </div>
            </main >

            <Footer onOpenModal={() => setIsModalOpen(true)} />
            <SubscriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div >
    );
};
