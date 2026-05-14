
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    Monitor, 
    MessageSquare, 
    ArrowRight, 
    GraduationCap, 
    BookOpen, 
    Trophy, 
    Clock, 
    Globe2,
    CheckCircle2,
    Leaf,
    Users,
    Sparkles,
    Youtube,
    FileText,
    MonitorIcon,
    Plus
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const subjects = [
    { name: "Math & STEM", icon: <Zap className="w-5 h-5" />, desc: "Algebra, Geometry, Calculus, and Computer Science." },
    { name: "History & Civics", icon: <Globe2 className="w-5 h-5" />, desc: "World history, political science, and social movements." },
    { name: "Literature & English", icon: <BookOpen className="w-5 h-5" />, desc: "Novel analysis, grammar, and essay structuring." },
    { name: "Sciences", icon: <Trophy className="w-5 h-5" />, desc: "Biology, Chemistry, and Physics—master every lab." },
];

const faqs = [
    {
        q: "Is Viszmo just for Math and Science?",
        a: "No! Viszmo works for every subject. Whether you're analyzing a poem in English class or studying the French Revolution in History, our AI can 'see' your text and provide instant explanations."
    },
    {
        q: "How does it help with homework?",
        a: "Instead of switching between your school portal and a search engine, Viszmo stays on your screen. Just click 'Scan' on any problem or paragraph you don't understand, and get an instant breakdown without leaving the page."
    },
    {
        q: "Is it safe to use with school portals?",
        a: "Viszmo is an overlay, not a browser extension. It doesn't modify your school portal's code or interfere with its systems. It's like having a tutor sitting next to you looking at your screen."
    },
    {
        q: "Does it work on Chromebooks?",
        a: "Currently, Viszmo is available for Windows 10 & 11. We are working on a web version and mobile app for Chromebook and iPad users!"
    },
    {
        q: "How much does it cost?",
        a: "Viszmo is free to get started! We offer a generous free tier for daily homework help, and an affordable Pro plan for students who need unlimited AI tutor access during exam season."
    },
    {
        q: "Can my parents see what I'm doing?",
        a: "Viszmo is designed for your privacy. We don't record your screen in the background. Only the snapshots you explicitly 'Scan' are used to give you answers."
    },
    {
        q: "Is this considered cheating?",
        a: "Viszmo is a study aid designed to explain concepts, not just provide answers. We encourage students to use it to understand 'why' a solution is correct, rather than just copying results."
    },
    {
        q: "How do I install it?",
        a: "Just click 'Get Viszmo Free', download the installer, and you'll be set up in under a minute. No complicated configurations required."
    }
];

export const MiddleHighStudyAppPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="Best AI Study App for Middle School and High School Students | Viszmo" 
                description="Viszmo is the live AI study overlay for middle and high schoolers. Get instant help on any subject — math, history, science, English, and more." 
                canonicalUrl="https://www.viszmo.com/study-app-for-middle-and-high-school-students"
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
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-indigo-50 border border-indigo-100">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Built for the next generation</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight text-slate-900 mb-8 leading-[0.85]">
                            Stop Stressing. <br />
                            <span className="text-[#0ea5e9]">Start Crushing</span> <br />
                            Your Homework.
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Homework shouldn't take all night. Viszmo is the live AI tutor that sits on your screen, explaining concepts in real-time so you can get done faster and actually understand it.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <button className="btn" onClick={onOpenDownload}>
                                    <span className="btn-text">Get Viszmo Free</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/study-overlay')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                How the overlay works <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Pain Points */}
                <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-32 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight leading-tight">
                                    No more switching <br /> between 50 tabs.
                                </h2>
                                <p className="text-white/60 text-xl leading-relaxed mb-12">
                                    You're on Canvas, watching a YouTube lecture, and checking a PDF. Every time you leave to search for an answer, you lose your flow. 
                                </p>
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <Youtube className="w-6 h-6 text-rose-500" />
                                        </div>
                                        <span className="text-lg font-bold">Works over YouTube & Lectures</span>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <span className="text-lg font-bold">Reads PDFs & Online Textbooks</span>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <MonitorIcon className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <span className="text-lg font-bold">Invisible on Screen Share</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-8 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="inline-block p-6 bg-[#0ea5e9] rounded-3xl shadow-2xl shadow-blue-500/20 mb-6">
                                            <Zap className="w-12 h-12 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-black mb-4">Instant Context.</h3>
                                        <p className="text-white/40 font-medium">The AI sees exactly what you see. No explaining needed.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Every Subject */}
                <section className="py-24 max-w-7xl mx-auto px-4 mb-32 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-16 tracking-tight">Not just for Math. <br /> For everything.</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {subjects.map((sub, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all text-left group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                    {sub.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{sub.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{sub.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Exam Season Angle */}
                <section className="py-24 bg-indigo-50/50 rounded-[4rem] mx-4 mb-32">
                    <div className="max-w-7xl mx-auto px-8 lg:px-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="order-2 lg:order-1">
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Your unfair advantage <br /> during finals week.</h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-12">
                                    Study smarter, not harder. Viszmo helps you master concepts in half the time by giving you instant clarity whenever you hit a wall. 
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        { t: "Go Paperless", d: "Digital-first learning that's better for the planet.", i: <Leaf className="text-emerald-500" /> },
                                        { t: "Affordable Access", d: "A world-class tutor for the price of a coffee.", i: <Clock className="text-blue-500" /> }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                                            <div className="mb-4">{item.i}</div>
                                            <h4 className="font-bold text-slate-900 mb-2">{item.t}</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.d}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 flex justify-center">
                                <div className="relative w-full max-w-sm">
                                    <div className="absolute inset-0 bg-indigo-200 rounded-full blur-[80px] opacity-30" />
                                    <div className="relative bg-white p-12 rounded-[3rem] border border-indigo-100 shadow-2xl text-center">
                                        <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-8" />
                                        <h3 className="text-2xl font-black text-slate-900">Be Top of Class.</h3>
                                        <p className="text-slate-400 mt-4 text-sm font-medium">Without the all-nighters.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 max-w-4xl mx-auto px-4 mb-32">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Common Questions</h2>
                        <p className="text-slate-500 font-medium">Everything you and your parents need to know.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-lg transition-all group">
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
                <section className="py-32 px-4">
                    <div className="max-w-6xl mx-auto bg-slate-900 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#0ea5e9]/5 animate-pulse" />
                        <h2 className="text-5xl md:text-8xl font-black text-white mb-12 tracking-tight">Built for students <br /> like you.</h2>
                        <div className="flex flex-col items-center gap-8">
                            <button 
                                onClick={onOpenDownload}
                                className="px-16 py-8 bg-[#0ea5e9] text-white font-black rounded-3xl shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                            >
                                Get Viszmo Free
                            </button>
                            <p className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase">No Flashcard Setup Required</p>
                        </div>
                    </div>
                </section>

                {/* Internal Links */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8">
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                        <button onClick={() => navigate('/real-time-ai-tutor')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Real-Time AI Tutor</button>
                        <button onClick={() => navigate('/pricing')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Pricing</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
