
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    Monitor, 
    PlayCircle, 
    ArrowRight, 
    CheckCircle2, 
    Plus,
    Youtube,
    Video,
    Layout,
    Globe2,
    BookOpen,
    GraduationCap,
    Clock,
    Pause
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const platforms = [
    { name: "YouTube", icon: <Youtube className="w-6 h-6 text-red-500" /> },
    { name: "Coursera", icon: <Globe2 className="w-6 h-6 text-blue-600" /> },
    { name: "Udemy", icon: <Video className="w-6 h-6 text-purple-600" /> },
    { name: "Zoom", icon: <Monitor className="w-6 h-6 text-[#0b5cff]" /> },
    { name: "Khan Academy", icon: <BookOpen className="w-6 h-6 text-emerald-600" /> },
    { name: "Canvas/Blackboard", icon: <Layout className="w-6 h-6 text-orange-600" /> },
];

const useCases = [
    {
        level: "Elementary School",
        role: "Learning Science",
        desc: "Watching a video about the solar system and asking 'How hot is the sun?' without leaving the video player.",
        icon: <BookOpen className="w-5 h-5 text-blue-500" />
    },
    {
        level: "Middle School",
        role: "History Documentary",
        desc: "Clarifying dates or key figures in a WWII documentary instantly to keep the narrative flow.",
        icon: <GraduationCap className="w-5 h-5 text-emerald-500" />
    },
    {
        level: "High School",
        role: "Math Tutorial",
        desc: "Scanning a complex Calculus derivation to get a step-by-step breakdown of the logic.",
        icon: <Zap className="w-5 h-5 text-purple-500" />
    },
    {
        level: "College & Beyond",
        role: "Lecture Recording",
        desc: "Transcribing and asking deep technical questions about a 2-hour Organic Chemistry lecture.",
        icon: <Monitor className="w-5 h-5 text-rose-500" />
    }
];

const faqs = [
    {
        q: "Does it block the video player?",
        a: "No. Viszmo is a transparent overlay that you can resize and move anywhere. You can position it in a corner or side so you never miss a second of the video."
    },
    {
        q: "Does it work with full-screen videos?",
        a: "Yes! Viszmo's 'Always on Top' technology keeps the overlay visible even when you are in full-screen mode on YouTube or your browser."
    },
    {
        q: "Can it see the video content?",
        a: "When you click 'Scan', Viszmo's Vision AI analyzes the current frame of the video. It recognizes text, diagrams, and equations just like it would on a static PDF."
    },
    {
        q: "Do I need to pause the video?",
        a: "You don't have to! You can scan and ask questions while the video is playing. This allows you to keep the audio flow going while getting visual clarification."
    },
    {
        q: "Is it better than ChatGPT for videos?",
        a: "ChatGPT requires you to copy-paste or upload files. Viszmo lives ON the video. It's the difference between having a tutor in the room with you vs. texting a friend for help later."
    },
    {
        q: "Does it work for school-specific portals?",
        a: "Yes. Whether you are using Canvas, Blackboard, or a custom university video player, if it's on your screen, Viszmo works with it."
    }
];

export const StudyWhileWatchingVideosPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="AI Screen Overlay for YouTube & Lectures | Viszmo" 
                description="Study while watching YouTube, Coursera, or Zoom. Viszmo's AI screen overlay lets you ask questions and get instant help without pausing your videos." 
                canonicalUrl="https://www.viszmo.com/study-while-watching-videos"
                noindex={false} 
            />

            <main className="relative pt-24 pb-32">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight text-slate-900 mb-8 leading-[0.85]">
                            Stop Pausing. <br />
                            <span className="text-[#0ea5e9]">Start Learning.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Going back and forth between YouTube and Google breaks your study flow. Viszmo sits on top of your videos so you can learn in real-time.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <button className="btn" onClick={onOpenDownload}>
                                    <span className="btn-text">Add Viszmo Free</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/study-overlay')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                How the Overlay works <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* The Problem Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative aspect-video bg-slate-900 rounded-[3rem] p-12 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
                            <Pause className="w-24 h-24 text-white/20 animate-pulse" />
                            <div className="absolute bottom-12 left-12 right-12 text-center">
                                <p className="text-white font-black text-xl uppercase tracking-widest">The Old Way: Constant Interruptions</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                                Never lose your <br /> place again.
                            </h2>
                            <p className="text-xl text-slate-500 leading-relaxed font-medium">
                                Research shows that every time you switch tabs, you lose up to 40% of your cognitive focus. Viszmo eliminates the 'Alt-Tab' shuffle by bringing the tutor to the video.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 text-slate-900 font-bold">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Keep the video playing.
                                </div>
                                <div className="flex items-center gap-4 text-slate-900 font-bold">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Scan diagrams instantly.
                                </div>
                                <div className="flex items-center gap-4 text-slate-900 font-bold">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Zero tab switching.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Platforms Grid */}
                <section className="py-24 max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Works on every platform.</h2>
                    <p className="text-slate-500 font-medium mb-16">Viszmo is an overlay, so it doesn't care where you're watching.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {platforms.map((platform, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                                <div className="mb-4 group-hover:scale-110 transition-transform flex justify-center">{platform.icon}</div>
                                <p className="font-bold text-slate-900 text-sm">{platform.name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Use Cases */}
                <section className="py-24 bg-slate-900 text-white rounded-[5rem] mx-4 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-8 lg:px-24">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">One tool. Every level.</h2>
                            <p className="text-white/40 text-xl font-medium">From simple questions to complex research.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {useCases.map((useCase, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6">{useCase.icon}</div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9] mb-2">{useCase.level}</p>
                                    <h3 className="text-lg font-bold mb-4">{useCase.role}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed font-medium">{useCase.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 max-w-4xl mx-auto px-4 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Video Study FAQ</h2>
                        <p className="text-slate-500 font-medium">Everything you need to know about the overlay experience.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:shadow-lg transition-all group">
                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-start gap-4">
                                    <Plus className="w-6 h-6 text-[#0ea5e9] shrink-0 mt-1 group-hover:rotate-90 transition-transform" />
                                    {faq.q}
                                </h4>
                                <p className="text-slate-500 leading-relaxed font-medium ml-10">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-32 px-4 text-center">
                    <div className="max-w-4xl mx-auto bg-slate-50 rounded-[4rem] p-16 md:p-32 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <PlayCircle className="w-32 h-32" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-12 tracking-tight leading-tight">Master your <br /> videos today.</h2>
                        <div className="flex flex-col items-center gap-8">
                            <button 
                                onClick={onOpenDownload}
                                className="px-16 py-8 bg-[#0ea5e9] text-white font-black rounded-3xl shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                            >
                                Add Viszmo Free
                            </button>
                            <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">No Setup Required</p>
                        </div>
                    </div>
                </section>

                {/* Internal Links */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8 text-sm">
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                        <button onClick={() => navigate('/real-time-ai-tutor')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Real-Time AI Tutor</button>
                        <button onClick={() => navigate('/pricing')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Pricing</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
