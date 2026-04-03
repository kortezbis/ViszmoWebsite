import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
    Download, PlayCircle, Scan, Sparkles, Radar, Mic
} from 'lucide-react';

export const HowItWorksPage = () => {
    const navigate = useNavigate();

    const steps = [
        {
            icon: <Download className="w-10 h-10 text-blue-500" />,
            title: "Download & Install",
            text: "Get Viszmo for Windows. Installation takes less than a minute. Create an account to receive free access on the house—or double it if you sign up with a referral link!",
            highlightColor: "bg-blue-500 shadow-blue-500/20"
        },
        {
            icon: <PlayCircle className="w-10 h-10 text-indigo-500" />,
            title: "Start a Session",
            text: "Launch the Dashboard and click \"Start Session\" to open the AI Overlay. It will float on top of any application.",
            highlightColor: "bg-indigo-500 shadow-indigo-500/20"
        },
        {
            icon: <Scan className="w-10 h-10 text-emerald-500" />,
            title: "Scan & Ask",
            text: "Click \"Scan\" on the overlay—it reads whatever is behind it on your screen. The AI analyzes it and provides instant answers, explanations, or solutions. No snipping or selecting required.",
            highlightColor: "bg-emerald-500 shadow-emerald-500/20"
        },
        {
            icon: <Sparkles className="w-10 h-10 text-purple-500" />,
            title: "Generate Study Materials",
            text: "Open the Study Hub to upload documents, paste links, or use your saved transcripts. Generate flashcards, quizzes, summaries, and more with one click.",
            highlightColor: "bg-purple-500 shadow-purple-500/20"
        },
        {
            icon: <Mic className="w-10 h-10 text-pink-500" />,
            title: "Record & Transcribe",
            text: "Open the Transcripts page to record lectures, meetings, videos, podcasts—anything. Choose system audio, microphone, or both. Transcripts are searchable and include AI tools: Summarize, Key Points, Action Items, and Chat. Save them to reuse in the Study Hub.",
            highlightColor: "bg-pink-500 shadow-pink-500/20"
        }
    ];

    const quickTips = [
        {
            title: "Toggle Overlay",
            text: "Press Ctrl + Shift + Space to show/hide the overlay from anywhere. Customize this hotkey in Settings."
        },

        {
            title: "Record Anything",
            text: "Capture audio from lectures, videos, podcasts, or meetings. Choose mic, system audio, or both. Transcripts appear on the Transcripts page."
        },
        {
            title: "Save Your Transcripts",
            text: "Hit \"Save\" after recording to keep your transcripts. Saved transcripts can be used in the Study Hub to generate materials."
        }
    ];

    return (
        <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col">
            <Navbar onOpenModal={() => navigate('/pricing')} />

            <main className="flex-1 relative pt-32">
                {/* Background (Shared) */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
                    <div className="absolute inset-0 bg-[#ffffff]" />
                    <div
                        className="absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/5 blur-[120px]" />
                    <div className="absolute top-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px]" />
                </div>

                {/* Hero Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                            How <span className="text-[#0ea5e9]">Viszmo Works</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            Get started in minutes. Here's everything you need to know.
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 pb-32">

                    {/* Steps Section */}
                    <div className="space-y-24">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start"
                            >
                                <div className="shrink-0 transform rotate-3">
                                    {step.icon}
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Step {i + 1}</div>
                                        <div className={`group inline-block ${step.highlightColor} -skew-x-12 px-6 py-2 shadow-lg transform transition-all duration-300 hover:skew-x-0 hover:scale-105`}>
                                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0">
                                                {step.title}
                                            </h2>
                                        </div>
                                    </div>
                                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                        {step.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Bonus Step */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="group relative rounded-[2.5rem] bg-gradient-to-br from-[#0ea5e9] via-blue-600 to-indigo-700 border border-white/20 overflow-hidden shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-500 max-w-5xl mx-auto"
                        >
                            <div className="p-10 md:p-16 relative z-0 flex flex-col items-center text-center">
                                <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #ffffff 27px, #ffffff 28px)',
                                        backgroundSize: '100% 100%'
                                    }}
                                />

                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition-colors duration-500"></div>

                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <div className="mb-10">
                                        <div className="group inline-block bg-white -skew-x-12 px-8 py-2.5 shadow-lg shadow-black/10 transform transition-all duration-300 hover:skew-x-0 hover:scale-105">
                                            <h2 className="text-2xl md:text-3xl font-black text-[#0ea5e9] uppercase tracking-wide transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 flex items-center gap-3">
                                                <Radar className="w-6 h-6 text-[#0ea5e9]" />
                                                Bonus: Auto-Scan for Tests
                                            </h2>
                                        </div>
                                    </div>

                                    <p className="text-blue-50 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium opacity-90">
                                        Taking an exam? Enable Auto-Scan to automatically detect and capture questions at intervals. The AI reads your screen in real-time and provides answers without any manual clicks—meaning you never have to interact with the overlay, staying focused on your session.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Tips Grid */}
                    <section>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Quick Tips</h2>
                            <p className="text-slate-500 text-lg">Master Viszmo in seconds.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {quickTips.map((tip, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/20 flex gap-6 items-start"
                                >
                                    <div className="space-y-4 text-left">
                                        <h3 className="text-xl font-bold text-slate-900">{tip.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                            {tip.text}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="text-center space-y-6 bg-transparent py-8 md:py-12">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                            Ready to get started?
                        </h2>
                        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of students using Viszmo to crush their coursework. Download now and get free access on the house.
                        </p>
                        <div className="flex flex-col items-center gap-6 pt-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="btn-wrapper">
                                    <button
                                        className="btn"
                                        onClick={() => navigate('/pricing')}
                                    >
                                        <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30" fill="currentColor">
                                            <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                                        </svg>
                                        <span className="btn-text">Get Viszmo Free</span>
                                    </button>
                                </div>
                                <div className="explore-btn-wrap" onClick={() => navigate('/pricing')}>
                                    <div className="explore-btn-shadow"></div>
                                    <button className="explore-btn">
                                        <span>Explore Pricing</span>
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">
                                WINDOWS 10 & 11 • SAFE
                            </p>
                        </div>
                    </section>

                </div>

                {/* Bottom Fade */}
                <div className="relative isolate w-full h-40 mt-auto">
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-b from-transparent to-[#d6dee8] -z-10 pointer-events-none" />
                </div>
            </main >

            <Footer onOpenModal={() => navigate('/pricing')} />
        </div >
    );
};
