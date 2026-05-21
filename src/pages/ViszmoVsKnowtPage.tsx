
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    Monitor, 
    MessageSquare, 
    ArrowRight, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Sparkles, 
    Plus,
    Layout,
    Globe2,
    BookOpen
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { DownloadCtaButton, useDesktopDownloadLabel } from '../components/DownloadCtaButton';
import { useNavigate } from 'react-router-dom';

const comparisonData = [
    { feature: "Live Screen Overlay", viszmo: true, knowt: false },
    { feature: "Real-Time Screen Reading", viszmo: true, knowt: false },
    { feature: "Invisible on Screen Share", viszmo: true, knowt: false },
    { feature: "AI Flashcard Generation", viszmo: true, knowt: true },
    { feature: "Free Import from Quizlet", viszmo: true, knowt: true },
    { feature: "Always-on Study Sidekick", viszmo: true, knowt: false },
];

const faqs = [
    {
        q: "What makes Viszmo better than Knowt?",
        a: "While Knowt is a fantastic free alternative to Quizlet for flashcards, Viszmo is a complete study sidekick. Viszmo lives on your screen as a transparent overlay, meaning it can see your lectures and PDFs in real-time. Knowt still requires you to switch between tabs to use its AI tools."
    },
    {
        q: "Can I use both together?",
        a: "Absolutely. Many students use Knowt for their flashcard database and use Viszmo's live overlay to scan their textbooks and lectures to generate those flashcards even faster."
    },
    {
        q: "Does Viszmo have a free version like Knowt?",
        a: "Yes! Viszmo has a generous free tier that includes access to our core AI study models and the signature study overlay."
    },
    {
        q: "How does the 'Real-Time' aspect work?",
        a: "Unlike Knowt, where you have to upload a file or copy text, Viszmo's overlay allows you to simply click 'Scan' on any part of your screen. The AI analyzes the visual context immediately."
    },
    {
        q: "Is Viszmo safe for proctored exams?",
        a: "Viszmo is intended as a learning and homework aid. We always recommend following your institution's specific academic integrity policies regarding AI assistants."
    },
    {
        q: "Which one is better for medical students?",
        a: "For pure memorization, both are great. However, for complex clinical scenarios shown in video lectures or high-res diagrams, Viszmo's screen-reading AI provides a massive advantage by identifying structures on screen."
    }
];

export const ViszmoVsKnowtPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const tryFreeLabel = useDesktopDownloadLabel('try-free');
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="Viszmo vs Knowt | The Best AI Study & Note Taker" 
                description="Compare Viszmo and Knowt. While Knowt focuses on notes, Viszmo provides a live AI overlay that works on any website or video in real-time." 
                canonicalUrl="https://www.viszmo.com/viszmo-vs-knowt"
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
                            <span className="text-[#0ea5e9]">Knowt.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Knowt is great for flashcards. Viszmo is for everything else. Get the only AI study tool that lives on your screen.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <DownloadCtaButton onClick={onOpenDownload} variant="try-free" />
                            </div>
                            <button 
                                onClick={() => navigate('/study-overlay')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                See the Overlay <ArrowRight className="w-5 h-5" />
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
                                <div className="text-center font-black text-slate-400">Knowt</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {comparisonData.map((item, i) => (
                                    <div key={i} className="grid grid-cols-3 p-8 items-center hover:bg-slate-50 transition-colors">
                                        <div className="text-lg font-bold text-slate-700">{item.feature}</div>
                                        <div className="flex justify-center">
                                            {item.viszmo ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-slate-200" />}
                                        </div>
                                        <div className="flex justify-center">
                                            {item.knowt ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-slate-200" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Knowt Does Well */}
                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">What Knowt <br /> does well.</h2>
                            <p className="text-lg text-slate-500 leading-relaxed mb-8">
                                We respect our competitors. Knowt is an excellent choice for students who need a 100% free alternative to Quizlet for basic flashcard study and practice exams. Their import tools are smooth and their community library is growing.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-slate-600 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Great for pure flashcard lovers.
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Solid Quizlet import features.
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 lg:order-2 bg-slate-100 aspect-video rounded-[3rem] flex items-center justify-center border border-slate-200">
                            <Layout className="w-20 h-20 text-slate-300" />
                        </div>
                    </div>
                </section>

                {/* The Viszmo Difference */}
                <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-32 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px] -mr-32 -mt-32" />
                    <div className="max-w-7xl mx-auto px-8 lg:px-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">The Viszmo <br /> Difference.</h2>
                                <p className="text-white/60 text-xl leading-relaxed mb-12">
                                    Knowt is an app you go to. Viszmo is an app that goes with you. Our live AI overlay means you never have to break your flow. 
                                </p>
                                <div className="space-y-8">
                                    {[
                                        { t: "Live Context", d: "Viszmo 'sees' your video lectures, PDFs, and Zoom calls without you lifting a finger.", i: <Monitor className="text-[#0ea5e9]" /> },
                                        { t: "Any Subject", d: "From Organic Chemistry to Medieval History—if it's on your screen, Viszmo can explain it.", i: <Globe2 className="text-purple-400" /> }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                                {item.i}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xl mb-2">{item.t}</h4>
                                                <p className="text-white/40 text-sm leading-relaxed">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative aspect-square bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center">
                                <div className="text-center">
                                    <Sparkles className="w-20 h-20 text-[#0ea5e9] mx-auto mb-8 animate-pulse" />
                                    <h3 className="text-3xl font-black mb-4">No Tab Switching.</h3>
                                    <p className="text-white/30 font-medium">Stay in the zone. Study smarter.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 max-w-4xl mx-auto px-4 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Common Questions</h2>
                        <p className="text-slate-500 font-medium">Why students are making the move to Viszmo.</p>
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
                    <div className="max-w-4xl mx-auto bg-blue-50 rounded-[4rem] p-16 md:p-24 border border-blue-100 shadow-sm relative overflow-hidden">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">Ready to upgrade <br /> your study flow?</h2>
                        <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto font-medium">
                            Experience the only study tool that lives on your screen.
                        </p>
                        <button 
                            onClick={onOpenDownload}
                            className="px-12 py-6 bg-[#0ea5e9] text-white font-black rounded-[2rem] shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                        >
                            {tryFreeLabel}
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
