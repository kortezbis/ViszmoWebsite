
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
    Layout,
    Globe2,
    BookOpen,
    Eye
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const comparisonData = [
    { feature: "Live Screen Overlay", viszmo: true, gizmo: false },
    { feature: "AI Tutoring", viszmo: true, gizmo: true },
    { feature: "Flashcard Creation", viszmo: true, gizmo: true },
    { feature: "Real-Time Visual Context", viszmo: true, gizmo: false },
    { feature: "Universal Subject Support", viszmo: true, gizmo: true },
    { feature: "Hotkey Instant Scan", viszmo: true, gizmo: false },
];

const faqs = [
    {
        q: "How does Viszmo compare to Gizmo?",
        a: "Gizmo is a great app for creating AI flashcards from notes. However, Viszmo's main advantage is its live study overlay. While Gizmo requires you to input information into their app, Viszmo lives on your screen and analyzes what you're seeing in real-time."
    },
    {
        q: "Is Viszmo better for video lectures?",
        a: "Yes. Because Viszmo is an overlay, you can have it active while watching a YouTube lecture or Zoom class. It 'sees' the slides and can explain concepts live, whereas with Gizmo, you'd have to take notes first and then import them."
    },
    {
        q: "Does Viszmo have AI tutoring like Gizmo?",
        a: "Absolutely. Viszmo features a 'Real-Time AI Tutor' that not only answers questions but provides deep context based on the specific material shown on your screen."
    },
    {
        q: "Can I use it on mobile?",
        a: "Viszmo is optimized for desktop as a study overlay for your main workspace. We also have mobile companions for studying your saved materials on the go."
    },
    {
        q: "Is it safe to use?",
        a: "Viszmo is built with privacy in mind. We only scan your screen when you explicitly trigger it via hotkey or button. We never record your background activity."
    }
];

export const ViszmoVsGizmoPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="Viszmo vs Gizmo — The Battle of AI Study Sidekicks | Viszmo" 
                description="Gizmo is great for notes, but Viszmo is the live study overlay that sees what you see. See why students are choosing the real-time advantage." 
                canonicalUrl="https://www.viszmo.com/viszmo-vs-gizmo"
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
                            <span className="text-[#0ea5e9]">Gizmo.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Both use AI to help you learn. Only one lives on your screen.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <button className="btn" onClick={onOpenDownload}>
                                    <span className="btn-text">Get Viszmo Free</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/how-it-works')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                How Viszmo Works <ArrowRight className="w-5 h-5" />
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
                                <div className="text-center font-black text-slate-400">Gizmo</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {comparisonData.map((item, i) => (
                                    <div key={i} className="grid grid-cols-3 p-8 items-center hover:bg-slate-50 transition-colors">
                                        <div className="text-lg font-bold text-slate-700">{item.feature}</div>
                                        <div className="flex justify-center">
                                            {item.viszmo ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-slate-200" />}
                                        </div>
                                        <div className="flex justify-center">
                                            {item.gizmo ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-slate-200" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Visual Advantage */}
                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
                                Visual context <br /> beats text input.
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed mb-12">
                                Gizmo is great if you already have the text. But what if you're watching a video? What if you're looking at a complex diagram or a math problem? 
                            </p>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Eye className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Sees What You See</h4>
                                        <p className="text-sm text-slate-500">Viszmo's Vision AI recognizes everything on your screen instantly.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">No More Copy-Paste</h4>
                                        <p className="text-sm text-slate-500">Don't break your flow. Get help while you stay in your course player or PDF.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-900 aspect-square rounded-[4rem] p-16 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#0ea5e9]/5 animate-pulse" />
                            <div className="text-center">
                                <Monitor className="w-24 h-24 text-white mb-8 mx-auto" />
                                <h3 className="text-2xl font-black text-white">The Overlay Era.</h3>
                                <p className="text-white/40 mt-4 font-medium">Why switch tabs when you can overlay?</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 max-w-4xl mx-auto px-4 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Common Questions</h2>
                        <p className="text-slate-500 font-medium">Understanding the difference between the two AI tools.</p>
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
                    <div className="max-w-4xl mx-auto bg-slate-50 rounded-[4rem] p-16 md:p-24 border border-slate-100 relative overflow-hidden">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">Try the Live AI <br /> Advantage.</h2>
                        <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto font-medium">
                            Join 200,000+ students and get the only AI tool that lives on your screen.
                        </p>
                        <button 
                            onClick={onOpenDownload}
                            className="px-12 py-6 bg-[#0ea5e9] text-white font-black rounded-[2rem] shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                        >
                            Get Viszmo Free
                        </button>
                    </div>
                </section>

                {/* Internal Links */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8 text-sm">
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                        <button onClick={() => navigate('/viszmo-vs-knowt')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Viszmo vs Knowt</button>
                        <button onClick={() => navigate('/real-time-ai-tutor')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Real-Time AI Tutor</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
