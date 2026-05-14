
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Monitor, BookOpen, GraduationCap, Globe2, MessageSquare, Plus } from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const comparisonData = [
    { feature: 'Live Screen Analysis', viszmo: true, quizlet: false },
    { feature: 'No-Prep Study Sessions', viszmo: true, quizlet: false },
    { feature: 'Universal Subject Support', viszmo: true, quizlet: true },
    { feature: 'Real-time Lecture Translation', viszmo: true, quizlet: false },
    { feature: 'AI-Powered Study Dashboard', viszmo: true, quizlet: true },
    { feature: 'Invisible Overlay Technology', viszmo: true, quizlet: false },
    { feature: 'Multi-Monitor Support', viszmo: true, quizlet: false },
    { feature: 'Spaced Repetition System', viszmo: true, quizlet: true },
];

const faqs = [
    {
        q: "How is Viszmo different from Quizlet?",
        a: "While Quizlet is excellent for flashcards and rote memorization, Viszmo is a live study sidekick that lives on your screen. Viszmo can read what you're looking at (lectures, PDFs, videos) and help you understand it in real-time, without you having to manually create flashcards first."
    },
    {
        q: "Does Viszmo replace Quizlet?",
        a: "Not necessarily! Many students use Quizlet for vocabulary and Viszmo for everything else. However, Viszmo's AI can automatically generate flashcards and quizzes from your screen, often making the manual creation process in Quizlet unnecessary."
    },
    {
        q: "Is Viszmo only for STEM subjects?",
        a: "No! Viszmo is designed for every subject, including History, Language Arts, Fine Arts, and Vocational studies. If you can see it on your screen or hear it in a lecture, Viszmo can help you study it."
    },
    {
        q: "Can I use Viszmo for college-level courses?",
        a: "Absolutely. Viszmo is used by students from elementary school all the way through medical school and bar exam prep. It adapts to the complexity of the material on your screen."
    },
    {
        q: "What is the 'Live Overlay' feature?",
        a: "Our signature feature is a transparent window that sits on top of your browser or apps. It uses AI to 'see' your screen content, allowing you to ask questions and get notes without ever switching tabs or losing focus."
    },
    {
        q: "Do I need to pay for Viszmo?",
        a: "Viszmo offers a generous free tier so you can experience the power of the AI overlay. We also have Pro plans for students who need unlimited transcription and advanced study modes."
    }
];

export const ViszmoVsQuizletPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900"
        >
            <SEO 
                title="Viszmo vs Quizlet — Which Study App Is Better?" 
                description="Quizlet is great for flashcards. Viszmo is great for everything else. See why students of all ages are switching to Viszmo live AI overlay." 
                canonicalUrl="https://www.viszmo.com/viszmo-vs-quizlet"
                noindex={false} 
            />

            <main className="relative pt-24 pb-32">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full text-xs font-bold uppercase tracking-widest text-[#0ea5e9] bg-blue-50 border border-blue-100">
                            Comparison Guide
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
                            Viszmo vs Quizlet: <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-indigo-500">
                                The Future of Studying.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Quizlet revolutionized digital flashcards. Viszmo is revolutionizing everything else. 
                            Compare the traditional flashcard app with the world's first live AI study sidekick.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button 
                                onClick={onOpenDownload}
                                className="px-8 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:scale-105 transition-all"
                            >
                                Try Viszmo Free
                            </button>
                            <button 
                                onClick={() => navigate('/how-it-works')}
                                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                See How It Works
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Comparison Table */}
                <section className="max-w-5xl mx-auto px-4 mb-32">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-slate-50/50 border-b border-slate-200">
                            <div className="p-6 md:p-8 text-sm font-bold text-slate-500 uppercase tracking-widest">Feature</div>
                            <div className="p-6 md:p-8 text-center text-lg font-black text-[#0ea5e9]">Viszmo</div>
                            <div className="p-6 md:p-8 text-center text-lg font-black text-slate-400">Quizlet</div>
                        </div>
                        {comparisonData.map((item, i) => (
                            <div key={i} className="grid grid-cols-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                <div className="p-6 md:p-8 text-sm md:text-base font-bold text-slate-700">{item.feature}</div>
                                <div className="p-6 md:p-8 flex justify-center items-center">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 flex justify-center items-center">
                                    {item.quizlet ? (
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <Check className="w-5 h-5 text-emerald-600" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                                            <X className="w-5 h-5 text-rose-600" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Fairness Section */}
                <section className="max-w-7xl mx-auto px-4 mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-[#0ea5e9] font-bold uppercase tracking-tighter text-sm mb-4 block">Fair & Honest Comparison</span>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">What Quizlet does well.</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Let's be honest: Quizlet is a classic for a reason. If you need to memorize a list of 50 biology terms or Spanish vocabulary, their spaced repetition and gamified flashcards are top-tier. 
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Their mobile app is great for studying on the bus, and they have millions of pre-made decks from other students. If your ONLY goal is rote memorization of simple terms, Quizlet is a solid choice.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Massive Library</h4>
                                        <p className="text-sm text-slate-500">Access millions of student-made decks.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Mobile Memorization</h4>
                                        <p className="text-sm text-slate-500">Perfect for quick vocab drills on the go.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Spaced Repetition</h4>
                                        <p className="text-sm text-slate-500">Proven methods for long-term retention.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Quizlet Cannot Do */}
                <section className="bg-slate-900 py-24 md:py-32 mb-32 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[120px]" />
                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">What Quizlet <span className="text-rose-500">cannot</span> do.</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                                Quizlet is a library. Viszmo is a sidekick. Here is why students are upgrading to live AI assistance.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                                <Monitor className="w-10 h-10 text-[#0ea5e9] mb-6" />
                                <h3 className="text-xl font-bold text-white mb-4">Live Screen Reading</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Viszmo stays on your screen, reading your PDFs, slides, and videos in real-time. You don't have to copy-paste or create anything; Viszmo just knows.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                                <Zap className="w-10 h-10 text-[#0ea5e9] mb-6" />
                                <h3 className="text-xl font-bold text-white mb-4">No-Prep Study</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Stop spending 2 hours making flashcards. Viszmo analyzes your screen instantly so you can start learning from the first minute.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                                <MessageSquare className="w-10 h-10 text-[#0ea5e9] mb-6" />
                                <h3 className="text-xl font-bold text-white mb-4">Interactive Tutor</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Ask Viszmo questions about what's on your screen. It's like having a private tutor sitting next to you, explaining complex concepts as they appear.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Universal Education */}
                <section className="max-w-7xl mx-auto px-4 mb-32">
                    <div className="text-center mb-16">
                        <span className="text-indigo-500 font-bold uppercase tracking-widest text-xs mb-4 block">Universal Education</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">For every subject. Every grade level.</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Whether you're in 5th grade or studying for the Bar Exam, Viszmo scales with your curriculum.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { icon: Globe2, label: "History & Arts", color: "bg-amber-50 text-amber-600" },
                            { icon: BookOpen, label: "Language Arts", color: "bg-blue-50 text-blue-600" },
                            { icon: Zap, label: "STEM & Math", color: "bg-purple-50 text-purple-600" },
                            { icon: GraduationCap, label: "Vocational", color: "bg-emerald-50 text-emerald-600" },
                        ].map((item, i) => (
                            <div key={i} className={`${item.color} p-8 rounded-3xl flex flex-col items-center text-center group hover:scale-105 transition-transform`}>
                                <item.icon className="w-10 h-10 mb-4" />
                                <span className="font-black text-lg">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-5xl mx-auto px-4 mb-32">
                    <div className="bg-gradient-to-br from-[#0ea5e9] to-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8">
                                Try Viszmo Free — <br /> No Flashcard Setup Required.
                            </h2>
                            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
                                Join over 200,000 students who have moved beyond manual flashcards. Download the live AI study sidekick today.
                            </p>
                            <button 
                                onClick={onOpenDownload}
                                className="px-10 py-5 bg-white text-[#0ea5e9] font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-lg"
                            >
                                Start Studying Faster
                            </button>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-3 flex items-start gap-3">
                                    <Plus className="w-5 h-5 text-[#0ea5e9] shrink-0 mt-0.5" />
                                    {faq.q}
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed ml-8">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Internal Links Footer */}
                <div className="mt-32 pt-16 border-t border-slate-100 text-center">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">Learn More About Viszmo</p>
                    <div className="flex justify-center gap-8">
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-600 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                        <button onClick={() => navigate('/how-it-works')} className="text-slate-600 hover:text-[#0ea5e9] font-bold transition-colors">How It Works</button>
                        <button onClick={() => navigate('/pricing')} className="text-slate-600 hover:text-[#0ea5e9] font-bold transition-colors">Pricing</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
