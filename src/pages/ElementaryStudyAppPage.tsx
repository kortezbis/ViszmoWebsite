
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, 
    ShieldCheck, 
    Palette, 
    Book, 
    Sparkles, 
    CheckCircle2, 
    ArrowRight,
    Leaf,
    Download,
    HelpCircle,
    Plus,
    Smile,
    Baby
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const subjects = [
    { name: "Reading & Phonics", icon: <Book className="w-5 h-5 text-blue-500" />, desc: "Helping young readers sound out words and understand stories." },
    { name: "Math Fundamentals", icon: <Sparkles className="w-5 h-5 text-amber-500" />, desc: "Visual explanations for addition, subtraction, and early geometry." },
    { name: "Science Explorer", icon: <Leaf className="w-5 h-5 text-emerald-500" />, desc: "Learning about nature, weather, and the human body in a fun way." },
    { name: "Social Studies", icon: <Palette className="w-5 h-5 text-purple-500" />, desc: "Discovering history, maps, and community through interactive help." },
];

const faqs = [
    {
        q: "Is Viszmo safe for children?",
        a: "Yes, Viszmo is built with a 'Privacy First' philosophy. We don't record background video, and our AI filters are tuned to provide child-appropriate explanations. We also don't sell any student data."
    },
    {
        q: "How do I set it up for my child?",
        a: "It's easy! Simply download the app on your home computer, create a parent account, and then let your child launch the overlay when they start their homework. You can even review their progress from your dashboard."
    },
    {
        q: "Does it do the homework for them?",
        a: "No. Viszmo is designed to be a tutor, not a cheat tool. It provides explanations, definitions, and step-by-step logic to help your child find the answer themselves."
    },
    {
        q: "What subjects does it cover?",
        a: "Viszmo covers all elementary subjects, including Reading, Math, Science, and Social Studies. It's especially great for explaining concepts shown in online videos or digital textbooks."
    },
    {
        q: "Is there a cost for the elementary version?",
        a: "Viszmo offers a generous free tier that includes access to our basic AI tutoring models, perfect for light homework help. We also have a Pro version for more intensive learning."
    },
    {
        q: "How does it help with 'Paperless Learning'?",
        a: "By providing digital annotations and instant answers directly on screen, Viszmo reduces the need for printing out worksheets and study guides, making your child's learning more eco-friendly."
    }
];

export const ElementaryStudyAppPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="Best AI Study App for Elementary School Students | Viszmo" 
                description="Viszmo makes learning fun for elementary students. A friendly AI study sidekick that answers questions live for any subject." 
                canonicalUrl="https://www.viszmo.com/study-app-for-elementary-students"
                noindex={false} 
            />

            <main className="relative pt-24 pb-32 overflow-hidden">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24 relative">
                    {/* Floating icons for "Fun" vibe */}
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 left-10 hidden lg:block opacity-20">
                        <Smile className="w-12 h-12 text-amber-500" />
                    </motion.div>
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity }} className="absolute bottom-40 right-20 hidden lg:block opacity-20">
                        <Palette className="w-10 h-10 text-purple-500" />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-amber-50 border border-amber-100">
                            <Baby className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Built for Young Learners</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                            A Study Buddy <br />
                            That Is Always <br />
                            <span className="text-[#0ea5e9]">There For You.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Warm, friendly, and smart. Viszmo is the AI study sidekick that helps elementary students understand concepts immediately—without the frustration.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <button className="btn" onClick={onOpenDownload}>
                                    <span className="btn-text">Try Viszmo Free</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/how-it-works')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                How Parents Setup <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Concept Section */}
                <section className="py-24 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                                <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-purple-500/5 group-hover:scale-110 transition-transform duration-700" />
                                    <Sparkles className="w-16 h-16 text-slate-200" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Understanding, <br /> Not Just Answering.</h2>
                                <p className="text-lg text-slate-500 leading-relaxed mb-8 font-medium">
                                    When a child gets stuck, they usually need a different way of looking at the problem. Viszmo uses visual and text context to explain things in simple, relatable terms.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Gentle, encouraging tone",
                                        "Visual-first explanations",
                                        "Zero context switching",
                                        "Safe, curated learning paths"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-3 font-bold text-slate-700">
                                            <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Subjects */}
                <section className="py-24 max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-16 tracking-tight">Works for all school subjects.</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {subjects.map((sub, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl transition-all text-left">
                                <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit border border-slate-50">
                                    {sub.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{sub.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{sub.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Parent Safety */}
                <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
                    <div className="max-w-7xl mx-auto px-8 lg:px-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-8">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="w-8 h-8 text-[#0ea5e9]" />
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Safe. Simple. <br /> Parent-Friendly.</h2>
                                <p className="text-white/70 text-xl leading-relaxed">
                                    We built Viszmo for our own families. That means privacy isn't an afterthought—it's the foundation.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        </div>
                                        <p className="text-white/80"><span className="text-white font-bold">Privacy First:</span> No background recording or data selling. Ever.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        </div>
                                        <p className="text-white/80"><span className="text-white font-bold">Easy Setup:</span> Install on your home PC and be ready in 60 seconds.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] text-center">
                                <h3 className="text-2xl font-black mb-8">Eco-Friendly Learning</h3>
                                <div className="mb-8 p-6 bg-emerald-500/10 rounded-3xl inline-block border border-emerald-500/20">
                                    <Leaf className="w-12 h-12 text-emerald-400" />
                                </div>
                                <p className="text-white/60 leading-relaxed font-medium">
                                    Go paperless! Reduce waste by helping your child learn digitally with real-time AI assistance instead of printing countless worksheets.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Parent FAQ</h2>
                        <p className="text-slate-500 font-medium text-lg">Everything you need to know about your child's new study buddy.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all group">
                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                    <Plus className="w-5 h-5 text-[#0ea5e9] shrink-0 group-hover:rotate-90 transition-transform" />
                                    {faq.q}
                                </h4>
                                <p className="text-slate-600 leading-relaxed font-medium ml-8">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-32 px-4 text-center">
                    <div className="max-w-4xl mx-auto bg-blue-50 rounded-[4rem] p-16 md:p-24 border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 p-8 opacity-20">
                            <Sparkles className="w-16 h-16 text-[#0ea5e9]" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">Ready to meet your buddy?</h2>
                        <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto font-medium">
                            Join thousands of parents making learning fun and easy for their kids.
                        </p>
                        <button 
                            onClick={onOpenDownload}
                            className="px-12 py-6 bg-[#0ea5e9] text-white font-black rounded-[2rem] shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                        >
                            Try Viszmo Free
                        </button>
                    </div>
                </section>

                {/* Internal Links */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8">
                        <button onClick={() => navigate('/how-it-works')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">How It Works</button>
                        <button onClick={() => navigate('/mission')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Our Mission</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
