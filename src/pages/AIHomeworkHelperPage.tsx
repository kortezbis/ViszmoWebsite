import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    CheckCircle2, 
    ArrowRight,
    HelpCircle,
    Plus,
    BookOpen,
    Brain,
    GraduationCap,
    Eye,
    PenTool,
    Lightbulb
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { DownloadCtaButton, useDesktopDownloadLabel } from '../components/DownloadCtaButton';
import { useNavigate } from 'react-router-dom';

const subjects = [
    { name: "Mathematics", icon: <Brain className="w-5 h-5 text-blue-500" />, desc: "Algebra, geometry, calculus, and statistics explanations with step-by-step logic." },
    { name: "Sciences", icon: <Sparkles className="w-5 h-5 text-amber-500" />, desc: "Physics, chemistry, biology, and computer science broken down intuitively." },
    { name: "History & Social Studies", icon: <GraduationCap className="w-5 h-5 text-purple-500" />, desc: "Contextual history explanations, map readings, and sociology connections." },
    { name: "English & Essays", icon: <PenTool className="w-5 h-5 text-emerald-500" />, desc: "Grammar guidance, essay outlining, thesis statement help, and reading analysis." },
];

const scenarios = [
    {
        title: "Stuck on a Math Equation?",
        desc: "Don't just copy a calculators output. Viszmo reads the equation on your screen, highlights the critical mathematical rules, and guides you through solving it yourself.",
        badge: "Math & Logic"
    },
    {
        title: "Confused by a Reading Passage?",
        desc: "Select the difficult text or document on your screen. Viszmo instantly defines complex vocabulary, simplifies elaborate phrasing, and breaks down the core arguments.",
        badge: "Reading Comprehension"
    },
    {
        title: "Need Essay or Outline Guidance?",
        desc: "Viszmo helps you organize your thoughts, refine your thesis statement, structure paragraphs, and brainstorm supporting arguments right alongside your writing app.",
        badge: "Writing & Outlining"
    }
];

const faqs = [
    {
        q: "What makes Viszmo better than searching Google or ChatGPT?",
        a: "Search engines just give you lists of links, and ChatGPT requires you to copy-paste or write complicated prompts. Viszmo is screen-aware: it sits right on your screen, sees what you see, and explains concepts in real-time without you ever having to switch windows or tabs."
    },
    {
        q: "Is Viszmo a cheating tool?",
        a: "Absolutely not. Viszmo is designed strictly as an educational tutor. It does not simply give you direct answers to copy; it breaks down the fundamental rules, provides step-by-step explanations, and helps you actually learn the material."
    },
    {
        q: "What subjects can Viszmo help with?",
        a: "Viszmo is fully versatile and covers all major school subjects—including mathematics (algebra to calculus), physics, chemistry, biology, history, English literature, foreign languages, and computer science."
    },
    {
        q: "Is it suitable for both high school and college students?",
        a: "Yes! Viszmo's AI models are highly advanced and automatically adapt their explanation level. It works perfectly for everything from high school AP/IB classes to complex college-level coursework."
    },
    {
        q: "How does the screen overlay work?",
        a: "Once you launch Viszmo, it sits as a transparent widget on your desktop. You can capture any region of your screen—like a PDF, a lecture video, or an online portal—and ask questions immediately without leaving your workspace."
    },
    {
        q: "Does Viszmo record my screen or compromise my privacy?",
        a: "Privacy is our absolute priority. Viszmo only reads the specific regions of the screen you explicitly select or interact with. We never record your background screen, and your personal data is never sold."
    },
    {
        q: "Is there a free tier for homework help?",
        a: "Yes, Viszmo offers a generous free tier that gives you daily access to our core AI tutoring models—perfect for daily homework assistance. You can upgrade to Viszmo Pro for unlimited screen queries and advanced features."
    },
    {
        q: "Does it work with digital textbooks and online homework portals?",
        a: "Yes, because Viszmo is desktop-native, it works on top of any software, browser, online portal (like Canvas or Blackboard), digital textbook, PDF reader, or YouTube video."
    }
];

export const AIHomeworkHelperPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const tryFreeLabel = useDesktopDownloadLabel('try-free');
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
                title="AI Homework Helper — Get Instant Answers While You Study | Viszmo" 
                description="Viszmo is the AI homework helper that lives on your screen. Get instant answers for any subject — from high school through college." 
                canonicalUrl="https://www.viszmo.com/ai-homework-helper"
                noindex={false} 
            />

            <main className="relative pt-24 pb-32 overflow-hidden">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24 relative">
                    <div className="absolute top-20 left-10 hidden lg:block opacity-20">
                        <BookOpen className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="absolute bottom-40 right-20 hidden lg:block opacity-20">
                        <Brain className="w-10 h-10 text-emerald-500" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-50 border border-blue-100">
                            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">On-Screen AI Helper</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                            Your AI Homework <br />
                            Helper is Always <br />
                            <span className="text-[#0ea5e9]">On Your Screen.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Viszmo lives transparently on your screen, explaining complex questions and showing steps in real-time—without you ever having to switch apps or copy-paste.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <DownloadCtaButton onClick={onOpenDownload} variant="try-free" />
                            </div>
                            <button 
                                onClick={() => navigate('/real-time-ai-tutor')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Meet the AI Tutor <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Beat the Rest Section */}
                <section className="py-24 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative">
                                <div className="aspect-video bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-indigo-500/5 group-hover:scale-110 transition-transform duration-700" />
                                    <Eye className="w-16 h-16 text-[#0ea5e9] mb-4" />
                                    <h4 className="text-lg font-bold text-slate-900 relative z-10">It Sees What You See</h4>
                                    <p className="text-xs text-slate-400 max-w-xs mt-2 relative z-10">Viszmo reads the active equations, graphs, reading passages, or video transcripts directly on your desktop.</p>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">How Viszmo Beats Google & ChatGPT.</h2>
                                <p className="text-lg text-slate-500 leading-relaxed mb-8 font-medium">
                                    Don't waste time digging through search results or constantly formatting code-blocks and copying questions. Viszmo works dynamically in place.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Visual-first screen analysis (reads graphs, diagrams, and equations)",
                                        "Zero copying or app-switching required",
                                        "Explains logic and rules rather than just showing raw answers",
                                        "Adapts automatically from high school basics to college coursework"
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

                {/* Scenario Cases */}
                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Real homework help, simplified.</h2>
                        <p className="text-slate-500 font-medium text-lg">See how Viszmo solves everyday studying bottlenecks instantly.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {scenarios.map((scene, i) => (
                            <div key={i} className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9] bg-[#0ea5e9]/5 px-3 py-1 rounded-full">{scene.badge}</span>
                                    <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">{scene.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{scene.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Subjects Grid */}
                <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
                    <div className="max-w-7xl mx-auto px-8 lg:px-24">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-16 tracking-tight text-center">Every subject, completely covered.</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {subjects.map((sub, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all text-left">
                                    <div className="mb-6 p-4 bg-white/10 rounded-2xl w-fit">
                                        {sub.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{sub.name}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed font-medium">{sub.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Homework FAQ</h2>
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
                            Homework Help On Screen. Download the overlay today and study smarter.
                        </p>
                        <button 
                            onClick={onOpenDownload}
                            className="px-12 py-6 bg-[#0ea5e9] text-white font-black rounded-[2rem] shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                        >
                            {tryFreeLabel}
                        </button>
                    </div>
                </section>

                {/* Footer Internal Nav */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8">
                        <button onClick={() => navigate('/ai-math-solver')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">AI Math Solver</button>
                        <button onClick={() => navigate('/real-time-ai-tutor')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">AI Tutor</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
