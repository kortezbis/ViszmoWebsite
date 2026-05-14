
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
    FileText,
    PieChart,
    Microscope,
    History,
    Languages,
    Calculator,
    Library,
    Plus
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const workflows = [
    { name: "Live Lectures", icon: <Monitor className="w-6 h-6 text-blue-500" />, desc: "Get instant clarity while watching live or recorded Zoom, Teams, or Panopto sessions." },
    { name: "Complex PDFs", icon: <FileText className="w-6 h-6 text-rose-500" />, desc: "Our AI 'sees' your research papers and textbook PDFs, explaining dense terminology in seconds." },
    { name: "Online Courses", icon: <Globe2 className="w-6 h-6 text-emerald-500" />, desc: "Perfect for Coursera, Udemy, and university portals like Canvas or Blackboard." },
    { name: "Research Assistant", icon: <Library className="w-6 h-6 text-purple-500" />, desc: "Highlight sections of articles to summarize findings or find related concepts instantly." },
];

const majors = [
    { name: "STEM & Medicine", icon: <Microscope className="w-5 h-5" />, desc: "Calculus, Organic Chemistry, Anatomy, and CS." },
    { name: "Business & Finance", icon: <PieChart className="w-5 h-5" />, desc: "Economics, Accounting, and Market Analysis." },
    { name: "Humanities & Arts", icon: <History className="w-5 h-5" />, desc: "World History, Philosophy, and Fine Arts." },
    { name: "Law & Languages", icon: <Languages className="w-5 h-5" />, desc: "Legal terminology and advanced linguistics." },
];

const faqs = [
    {
        q: "Is Viszmo allowed in college courses?",
        a: "Viszmo is a study aid designed to help you understand your material. It works like a private tutor that's always available. As with any AI tool, we recommend checking your professor's specific policies on AI assistants."
    },
    {
        q: "How does it handle complex math and chemistry?",
        a: "Our Vision AI is specifically trained to recognize mathematical notation and structural diagrams (like chemical bonds or circuit diagrams). It provides logic-based explanations, not just final answers."
    },
    {
        q: "Does it work with proctored exams?",
        a: "Viszmo is for learning and homework help. Many proctored environments restrict all external applications. Always ensure you are following your institution's academic integrity rules."
    },
    {
        q: "How does the overlay work on a small laptop?",
        a: "The overlay is fully resizable and can be toggled instantly with a hotkey. It takes up minimal screen space and can be moved anywhere to avoid blocking your course content."
    },
    {
        q: "Can I save my study sessions?",
        a: "Yes! Every interaction is automatically synced to your dashboard. You can revisit explanations, turn them into flashcards, or export them as study guides."
    },
    {
        q: "Is there a discount for students?",
        a: "We have a generous free tier that's perfect for most students. For those who need heavy-duty assistance during finals, our Pro plan is priced to be affordable on a student budget."
    },
    {
        q: "How do I use it with PDFs?",
        a: "Just open your PDF in any viewer (browser, Adobe, etc.) and launch the Viszmo overlay. Click 'Scan' on the paragraph or problem you need help with, and the AI will analyze it immediately."
    },
    {
        q: "What makes it 'Green AI'?",
        a: "We use energy-efficient inference routing and optimized models that consume significantly less power than traditional large-scale AI requests, helping you study sustainably."
    }
];

export const CollegeStudyAppPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="Best AI Study App for College Students | Viszmo" 
                description="Viszmo is the live AI study overlay for college students. Get instant answers during lectures, PDFs, or course videos — any major." 
                canonicalUrl="https://www.viszmo.com/study-app-for-college-students"
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
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-slate-900 text-white">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Built for Higher Education</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight text-slate-900 mb-8 leading-[0.85]">
                            The Study Flow <br />
                            <span className="text-[#0ea5e9]">Upgrade</span> You <br />
                            Actually Need.
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            College is hard. Your study tools shouldn't be. Viszmo lives on your screen to help you master lectures, research, and finals in real-time.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <button className="btn" onClick={onOpenDownload}>
                                    <span className="btn-text">Get Viszmo Free</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/viszmo-vs-quizlet')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Why it beats Quizlet <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Workflow Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Fits into your workflow.</h2>
                            <p className="text-xl text-slate-500 font-medium">Your tools, your screen, your time.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {workflows.map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                    <div className="mb-6">{item.icon}</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.name}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Any Major */}
                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                                Works for every <br /> major. <span className="text-slate-400">Not just STEM.</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {majors.map((major, i) => (
                                    <div key={i} className="flex flex-col gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
                                            {major.icon}
                                        </div>
                                        <h3 className="font-bold text-slate-900">{major.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{major.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-slate-900 rounded-[4rem] p-12 flex flex-col justify-center text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <Library className="w-32 h-32" />
                                </div>
                                <h3 className="text-3xl font-black mb-6">The Academic Edge.</h3>
                                <p className="text-white/60 leading-relaxed font-medium mb-12">
                                    Whether you're in Law, Finance, or Fine Arts, Viszmo provides the context you need to excel in your coursework without the burnout.
                                </p>
                                <div className="flex gap-4">
                                    <span className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Ethical AI</span>
                                    <span className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Legal Tutor</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Finals Week */}
                <section className="py-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-[5rem] mx-4 mb-32 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="max-w-4xl mx-auto text-center relative z-10 px-8">
                        <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tight">Master Finals Week.</h2>
                        <p className="text-white/60 text-xl md:text-2xl mb-12 leading-relaxed">
                            Stop pulling all-nighters. Viszmo helps you digest weeks of content in hours, turning complex lectures into clear explanations instantly.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                { t: "Green AI", d: "Eco-friendly inference.", i: <Leaf className="w-5 h-5 text-emerald-400" /> },
                                { t: "Affordable", d: "Student-budget friendly.", i: <Clock className="w-5 h-5 text-blue-400" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                                    {item.i}
                                    <div className="text-left">
                                        <p className="font-bold text-sm leading-none mb-1">{item.t}</p>
                                        <p className="text-[10px] text-white/40 leading-none">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 max-w-4xl mx-auto px-4 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">College FAQ</h2>
                        <p className="text-slate-500 font-medium">Everything you need to know about AI-assisted learning.</p>
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
                    <div className="max-w-6xl mx-auto bg-slate-50 rounded-[4rem] p-16 md:p-32 border border-slate-100 shadow-sm">
                        <h2 className="text-5xl md:text-8xl font-black text-slate-900 mb-12 tracking-tight">Study smarter. <br /> Not harder.</h2>
                        <div className="flex flex-col items-center gap-8">
                            <button 
                                onClick={onOpenDownload}
                                className="px-16 py-8 bg-[#0ea5e9] text-white font-black rounded-3xl shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl"
                            >
                                Get Viszmo Free
                            </button>
                            <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">No Credit Card Required</p>
                        </div>
                    </div>
                </section>

                {/* Internal Links */}
                <div className="mt-24 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8">
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                        <button onClick={() => navigate('/viszmo-vs-quizlet')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Viszmo vs Quizlet</button>
                        <button onClick={() => navigate('/pricing')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Pricing</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
