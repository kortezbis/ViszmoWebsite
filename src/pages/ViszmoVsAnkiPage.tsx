
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    Monitor, 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    Sparkles, 
    Plus,
    Clock,
    BookOpen,
    Database,
    ZapOff,
    MonitorIcon
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const comparisonData = [
    { feature: "Live Screen Overlay", viszmo: true, anki: false },
    { feature: "Spaced Repetition (SRS)", viszmo: true, anki: true },
    { feature: "AI Automated Card Creation", viszmo: true, anki: false },
    { feature: "Real-Time AI Tutoring", viszmo: true, anki: false },
    { feature: "Universal App Support", viszmo: true, anki: false },
    { feature: "Cloud Sync & Dashboard", viszmo: true, anki: true },
];

const faqs = [
    {
        q: "Why use Viszmo over Anki?",
        a: "Anki is excellent for memorizing cards you've already made, but the process of making those cards is slow and manual. Viszmo's live overlay allows you to scan your lectures and notes to generate high-quality study materials in seconds, not hours."
    },
    {
        q: "Does Viszmo use Spaced Repetition?",
        a: "Yes! While Anki is the pioneer of SRS, Viszmo integrates modern spaced repetition algorithms into our dashboard, so you get the benefits of Anki's memorization with Viszmo's real-time capture."
    },
    {
        q: "Is it easier to use than Anki?",
        a: "Anki has a famously steep learning curve. Viszmo is designed for simplicity. Our UI is intuitive, glassmorphic, and works right out of the box without needing complex plugins or custom CSS."
    },
    {
        q: "Can I import my Anki decks?",
        a: "We are currently working on a universal importer that will allow you to bring your favorite decks from Anki and Quizlet directly into your Viszmo dashboard."
    },
    {
        q: "Is Viszmo better for Med School?",
        a: "Med students love Anki for raw memorization. They love Viszmo for understanding the 'why' behind the facts. During a live lecture or dissection video, Viszmo's overlay provides instant context that a static flashcard can't match."
    }
];

export const ViszmoVsAnkiPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="Viszmo vs Anki | AI-Powered Studying Beyond Flashcards" 
                description="Compare Viszmo and Anki. Move beyond complex deck management and switch to a live AI tutor that reads your screen instantly." 
                canonicalUrl="https://www.viszmo.com/viszmo-vs-anki"
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
                            Viszmo vs <br />
                            <span className="text-[#0ea5e9]">Anki.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Anki is for memorizing. Viszmo is for learning. 
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <button className="btn" onClick={onOpenDownload}>
                                    <span className="btn-text">Try Viszmo Free</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/pricing')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                See Pricing <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Comparison Table */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                            <div className="grid grid-cols-3 p-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="text-sm font-black uppercase tracking-widest text-slate-400">Feature</div>
                                <div className="text-center font-black text-slate-900">Viszmo</div>
                                <div className="text-center font-black text-slate-400">Anki</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {comparisonData.map((item, i) => (
                                    <div key={i} className="grid grid-cols-3 p-8 items-center hover:bg-slate-50 transition-colors">
                                        <div className="text-lg font-bold text-slate-700">{item.feature}</div>
                                        <div className="flex justify-center">
                                            {item.viszmo ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-slate-200" />}
                                        </div>
                                        <div className="flex justify-center">
                                            {item.anki ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-slate-200" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Automation Section */}
                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Stop spending <br /> hours on cards.</h2>
                            <p className="text-lg text-slate-500 leading-relaxed mb-12">
                                The biggest problem with Anki is the 'creation friction.' Most students spend more time making cards than actually studying them. Viszmo solves this with automated AI capture.
                            </p>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-slate-900">Automated Capture</h4>
                                        <p className="text-slate-500">Scan any screen and let the AI generate your study notes and flashcards for you.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded-2xl flex items-center justify-center shrink-0">
                                        <MonitorIcon className="w-6 h-6 text-[#0ea5e9]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-slate-900">Live Context</h4>
                                        <p className="text-slate-500">Unlike Anki's static cards, Viszmo provides help while you're actually watching your lecture.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 aspect-square rounded-[4rem] p-16 flex items-center justify-center border border-slate-100 shadow-sm">
                            <div className="text-center">
                                <Database className="w-24 h-24 text-slate-200 mx-auto mb-8" />
                                <h3 className="text-2xl font-black text-slate-900">The Power of AI.</h3>
                                <p className="text-slate-400 mt-4 font-medium">Your brain's external hard drive, but smarter.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 max-w-4xl mx-auto px-4 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Common Questions</h2>
                        <p className="text-slate-500 font-medium">Why the next generation of students is choosing Viszmo.</p>
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
                    <div className="max-w-4xl mx-auto bg-[#0ea5e9] rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">Ready to master <br /> your exams?</h2>
                        <p className="text-white/80 text-xl mb-12 max-w-xl mx-auto font-medium">
                            The memorization of Anki with the real-time power of Viszmo AI.
                        </p>
                        <button 
                            onClick={onOpenDownload}
                            className="px-16 py-8 bg-white text-[#0ea5e9] font-black rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all text-2xl"
                        >
                            Get Viszmo Now
                        </button>
                    </div>
                </section>

                {/* Internal Links */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8 text-sm">
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                        <button onClick={() => navigate('/viszmo-vs-quizlet')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Viszmo vs Quizlet</button>
                        <button onClick={() => navigate('/real-time-ai-tutor')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Real-Time AI Tutor</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
