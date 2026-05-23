import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    CheckCircle2, 
    ArrowRight,
    HelpCircle,
    Plus,
    BookOpen,
    GraduationCap,
    Clock,
    Flame,
    FileText,
    Dribbble
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { DownloadCtaButton, useDesktopDownloadLabel } from '../components/DownloadCtaButton';
import { useNavigate } from 'react-router-dom';

const routineSteps = [
    { 
        title: "1. Active Studying with Screen Overlay", 
        desc: "Open your digital textbook, notes, or lecture recording. Activate the transparent Viszmo overlay on your desktop. Ask questions and clarify complex equations immediately in place." 
    },
    { 
        title: "2. Generate Study Dashboard Decks", 
        desc: "Save important highlights and captured explanations directly into your personalized dashboard. Viszmo automatically converts your saved screen items into custom flashcard decks." 
    },
    { 
        title: "3. Retain with Smart Study Modes", 
        desc: "Utilize one of our 8 active learning study modes (like Flashcards, Match Game, or Rapid-Fire) powered by spaced repetition to commit the formulas and definitions to memory." 
    },
];

const scenarios = [
    {
        title: "Prepping for Semester Finals?",
        desc: "Don't compile hundreds of pages of text manually. Let Viszmo read your study PDFs and lecture recordings, summarize the critical concepts, and draft personalized study guides automatically.",
        badge: "Exam Prep"
    },
    {
        title: "Reviewing University Lectures?",
        desc: "Listen to lectures on YouTube or Zoom. Viszmo's live lecture listener transcribes the audio, generates structured outlines, and highlights important definitions in real time.",
        badge: "Lecture Notes"
    },
    {
        title: "Prepping for SAT, ACT, or MCAT?",
        desc: "Practicing difficult diagnostic questions? Run Viszmo alongside your practice portal. It immediately visualizes reading passages and explains math steps so you learn standard testing logic.",
        badge: "Test Prep"
    }
];

const faqs = [
    {
        q: "What makes Viszmo a complete AI study assistant?",
        a: "Unlike simple calculators or basic chat interfaces, Viszmo is an end-to-end study partner. It lives on your screen as a transparent overlay to explain questions in real-time, and it seamlessly connects to a personal study dashboard where it helps you manage flashcards, quizzes, and AI-generated podcasts."
    },
    {
        q: "How does spaced repetition study work in Viszmo?",
        a: "Viszmo tracks how well you remember individual flashcards. Using a built-in spaced repetition algorithm, it surfaces card reviews exactly when your brain is about to forget them, helping you memorize facts, formulas, and vocabulary in up to 50% less time."
    },
    {
        q: "Can I sync study decks between my desktop overlay and my dashboard?",
        a: "Yes, completely! Anything you capture or study using your on-screen transparent desktop overlay is immediately synced with your online Viszmo study dashboard so you can access it anywhere, on any device."
    },
    {
        q: "Does the AI assistant support multiple courses and subjects?",
        a: "Absolutely. You can create separate, customized Workspaces in your dashboard for each of your classes (e.g., Biology 101, Calculus, European History). Viszmo keeps all your flashcards, lectures, and summaries neatly organized by course."
    },
    {
        q: "How do I build a study routine around Viszmo?",
        a: "We recommend keeping Viszmo open as a background companion whenever you study. Use the screen capture tool to log difficult terms or math problems as you find them, and spend the last 10 minutes of your study session reviewing your generated flashcard deck."
    },
    {
        q: "Can Viszmo translate and explain foreign languages?",
        a: "Yes! Viszmo handles translation and grammatical explanations in real-time. It reads foreign text on screen, translates it into English, and explains the sentence structure, conjugation, and vocabulary in detail."
    },
    {
        q: "Is there a desktop application I need to download?",
        a: "Yes, the core transparent study overlay runs as a native desktop application (available for Windows, with macOS coming soon!). This is what allows it to work seamlessly on top of other applications without tab-switching."
    },
    {
        q: "Does it support custom note uploads like PDFs and docs?",
        a: "Yes, you can upload PDFs, Word documents, text files, and audio recordings directly into your study dashboard. Viszmo parses the files and generates flashcard decks, study guides, and mock tests in seconds."
    }
];

export const AIStudyAssistantPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const getFreeLabel = useDesktopDownloadLabel('get-free');
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="AI Study Assistant — Your Smart Study Partner | Viszmo" 
                description="Viszmo is the AI study assistant that works live on your screen. Ask questions, get explanations, and study smarter — built for high school and college students." 
                canonicalUrl="https://www.viszmo.com/ai-study-assistant"
                noindex={false} 
            />

            <main className="relative pt-24 pb-32 overflow-hidden">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24 relative">
                    <div className="absolute top-20 left-10 hidden lg:block opacity-20">
                        <BookOpen className="w-12 h-12 text-[#0ea5e9]" />
                    </div>
                    <div className="absolute bottom-40 right-20 hidden lg:block opacity-20">
                        <GraduationCap className="w-12 h-12 text-purple-500" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-emerald-50 border border-emerald-100">
                            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Smart Study Partner</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                            The AI Study <br />
                            Assistant That <br />
                            <span className="text-[#0ea5e9]">Learns With You.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Meet Viszmo. An all-in-one AI study assistant that reads your active screen in real-time, builds automatic study decks, and structures your memory spaced repetition.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <DownloadCtaButton onClick={onOpenDownload} variant="get-free" />
                            </div>
                            <button 
                                onClick={() => navigate('/ai-homework-helper')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                AI Homework Help <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* What Makes Viszmo Different */}
                <section className="py-24 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                                <div className="aspect-video bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-purple-500/5 group-hover:scale-110 transition-transform duration-700" />
                                    <Flame className="w-16 h-16 text-emerald-500 mb-4" />
                                    <h4 className="text-lg font-bold text-slate-900 relative z-10">All-in-One Dashboard</h4>
                                    <p className="text-xs text-slate-400 max-w-xs mt-2 relative z-10">Upload lectures, generate high-quality outlines, practice mock tests, and review spaced repetition flashcards in place.</p>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">An assistant that sees your desktop.</h2>
                                <p className="text-lg text-slate-500 leading-relaxed mb-8 font-medium">
                                    No more formatting templates or shifting focus. Viszmo sits as an active desktop overlay on your PC to deliver answers where you work.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Seamless transparent desktop study overlay",
                                        "Interactive mock exams and auto-generated spaced repetition flashcards",
                                        "Transforms PDFs, transcripts, and lectures into guides instantly",
                                        "Built specifically for high school and university coursework"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-3 font-bold text-slate-700">
                                            <CheckCircle2 className="w-5 h-5 text-[#0ea5e9] shrink-0" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Daily Routine Steps */}
                <section className="py-24 max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-16 tracking-tight">Your daily study routine, optimized.</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {routineSteps.map((step, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl transition-all text-left flex flex-col justify-between">
                                <div>
                                    <div className="mb-6 p-4 bg-emerald-50 rounded-2xl w-fit border border-emerald-50">
                                        <Clock className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Scenarios Section */}
                <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
                    <div className="max-w-7xl mx-auto px-8 lg:px-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Built for real studying constraints.</h2>
                            <p className="text-white/60 font-medium text-lg">See how Viszmo solves everyday studying bottlenecks instantly.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {scenarios.map((scene, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all text-left">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9] bg-white/10 px-3 py-1 rounded-full">{scene.badge}</span>
                                    <h3 className="text-xl font-bold text-white mt-6 mb-3">{scene.title}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed font-medium">{scene.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Study Assistant FAQ</h2>
                        <p className="text-slate-500 font-medium text-lg">How Viszmo builds confidence and helps students learn faster.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div 
                                key={i} 
                                className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => toggleFaq(i)}
                            >
                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-between gap-3">
                                    <span className="flex items-center gap-3">
                                        <HelpCircle className="w-5 h-5 text-[#0ea5e9] shrink-0" />
                                        {faq.q}
                                    </span>
                                    <Plus className={`w-5 h-5 text-[#0ea5e9] shrink-0 transition-transform duration-300 ${openFaqIndex === i ? 'rotate-45' : ''}`} />
                                </h4>
                                <AnimatePresence>
                                    {(openFaqIndex === i) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-slate-600 leading-relaxed font-medium mt-4 ml-8">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Block */}
                <section className="py-32 px-4 text-center">
                    <div className="max-w-4xl mx-auto bg-blue-50 rounded-[4rem] p-16 md:p-24 border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 p-8 opacity-20">
                            <Sparkles className="w-16 h-16 text-[#0ea5e9]" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">Try Viszmo Free</h2>
                        <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto font-medium">
                            Your Smart Study Partner. Get started today and accelerate your learning routines.
                        </p>
                        <button 
                            onClick={onOpenDownload}
                            className="px-12 py-6 bg-[#0ea5e9] text-white font-black rounded-[2rem] shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                        >
                            {getFreeLabel}
                        </button>
                    </div>
                </section>

                {/* Footer Internal Nav */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8">
                        <button onClick={() => navigate('/ai-homework-helper')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">AI Homework Helper</button>
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
