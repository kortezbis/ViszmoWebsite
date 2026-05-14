
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    Shield, 
    Monitor, 
    BookOpen, 
    GraduationCap, 
    Globe2, 
    Sparkles, 
    MessageSquare, 
    Plus, 
    Leaf,
    Clock,
    CheckCircle2,
    ArrowRight,
    School,
    Users
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { useNavigate } from 'react-router-dom';

const subjects = [
    { name: "Mathematics", icon: <Zap className="w-5 h-5" />, desc: "From basic arithmetic to advanced calculus and linear algebra." },
    { name: "Science", icon: <Globe2 className="w-5 h-5" />, desc: "Biology, Chemistry, Physics, and Environmental Science." },
    { name: "History", icon: <School className="w-5 h-5" />, desc: "World history, political science, and social studies." },
    { name: "Language Arts", icon: <BookOpen className="w-5 h-5" />, desc: "Literature, composition, and grammar analysis." },
    { name: "Foreign Languages", icon: <Users className="w-5 h-5" />, desc: "Real-time translation and grammatical explanations." },
    { name: "Vocational & Arts", icon: <Sparkles className="w-5 h-5" />, desc: "Coding, digital arts, and trade-specific learning." },
];

const scenarios = [
    { level: "Elementary", context: "Reading Comprehension", action: "Viszmo highlights key themes and explains difficult words as the student reads a digital book." },
    { level: "Middle School", context: "Pre-Algebra Homework", action: "The AI tutor breaks down a complex word problem into manageable steps without giving the answer away." },
    { level: "High School", context: "AP History Essay", action: "Viszmo provides historical context and primary source references for a specific era shown on screen." },
    { level: "College", context: "Organic Chemistry Lecture", action: "As the professor draws molecules, the AI explains the reaction mechanisms in real-time." },
];

const faqs = [
    {
        q: "How does 'Real-Time' differ from ChatGPT?",
        a: "Standard AI like ChatGPT requires you to copy and paste text or upload files, which is a 'delayed' process. Viszmo is 'Real-Time' because it lives on your screen and 'sees' your context instantly. You don't have to explain what you're looking at—Viszmo already knows."
    },
    {
        q: "Is it really suitable for elementary students?",
        a: "Yes! Viszmo's AI is adaptive. It detects the complexity of the material and adjusts its tone and explanation style to match the grade level of the user."
    },
    {
        q: "How does it 'read' my screen?",
        a: "Viszmo uses advanced Vision AI to analyze pixels on your screen when you trigger a scan. It recognizes text, mathematical symbols, and even structural diagrams like flowcharts or chemical bonds."
    },
    {
        q: "Is my screen being recorded?",
        a: "Never. Viszmo only analyzes a 'snapshot' of your screen when you explicitly click 'Scan' or use a hotkey. We do not record video or monitor your activities in the background."
    },
    {
        q: "What makes it a 'Green AI'?",
        a: "Our models are optimized for efficiency. By using localized processing and intelligent request routing, we minimize the carbon footprint associated with large-scale AI computations compared to traditional high-resource models."
    },
    {
        q: "Can it help with learning a new language?",
        a: "Absolutely. You can use Viszmo to translate websites in real-time or ask for the grammatical reasoning behind a specific sentence structure on your screen."
    },
    {
        q: "Does it work with Zoom or Google Meet?",
        a: "Yes! The overlay sits on top of any video conferencing app. It can transcribe the lecture and answer questions about the slides being shared by your teacher."
    },
    {
        q: "How do I get started?",
        a: "Simply download the Windows application, create an account, and launch the overlay. You'll be ready to start your first real-time study session in under a minute."
    }
];

export const RealTimeAITutorPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-slate-900 selection:bg-[#0ea5e9]/10"
        >
            <SEO 
                title="Real-Time AI Tutor | Instant Help with Screen Reading | Viszmo" 
                description="Viszmo is the live AI tutor that answers questions instantly for any subject. Our AI reads your screen to provide real-time help without copy-pasting." 
                canonicalUrl="https://www.viszmo.com/real-time-ai-tutor"
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
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-50 border border-blue-100">
                            <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9]">The Future of Tutoring</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                            A Real-Time <br />
                            <span className="text-[#0ea5e9]">AI Tutor</span> for <br />
                            Every Student.
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            No copy-pasting. No uploading. Viszmo lives on your screen to explain, guide, and tutor you through any subject in real-time.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <button className="btn" onClick={onOpenDownload}>
                                    <span className="btn-text">Get Your AI Tutor Now</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/how-it-works')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                See How It Works <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Real-Time vs Delayed */}
                <section className="max-w-6xl mx-auto px-4 mb-32">
                    <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
                                    Real-Time <br />
                                    <span className="text-slate-500">vs.</span> Delayed AI.
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Most AI tools require you to break your flow. You have to leave your lecture, copy text into ChatGPT, or create a set in Quizlet. 
                                </p>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                                            <Clock className="w-4 h-4 text-rose-500" />
                                        </div>
                                        <p className="text-slate-300 font-medium">Delayed: ChatGPT requires manual input and context switching.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                                            <Zap className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <p className="text-white font-bold">Real-Time: Viszmo stays on screen and sees your context instantly.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-[#0ea5e9] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                        <Monitor className="w-10 h-10 text-white" />
                                    </div>
                                    <span className="text-white font-black text-2xl">Always Active. <br /> Always Helpful.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Subjects Grid */}
                <section className="max-w-7xl mx-auto px-4 mb-32 text-center">
                    <span className="text-[#0ea5e9] font-black uppercase tracking-widest text-xs mb-4 block">Universal Learning</span>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-16 tracking-tight">Every subject, at any level.</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjects.map((subject, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all group text-left">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                                    {subject.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{subject.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{subject.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Grade Levels */}
                <section className="bg-slate-50 py-24 md:py-32 mb-32">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {scenarios.map((item, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9] mb-2 block">{item.level}</span>
                                            <h4 className="font-bold text-slate-900 mb-2">{item.context}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{item.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Elementary to Grad School.</h2>
                                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                                    Viszmo's AI is adaptive. It understands the context of the user and provides explanations that are age-appropriate and curriculum-aligned.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-slate-700 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Middle & High School Prep
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> University & Professional Exams
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-700 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Adult & Vocational Education
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Privacy & Green AI */}
                <section className="max-w-7xl mx-auto px-4 mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Privacy Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-slate-100 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Shield className="w-12 h-12 text-[#0ea5e9]/20" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-6">Privacy First.</h2>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                We believe learning should be private. Viszmo only analyzes your screen when you tell it to. We don't record background video, we don't sell data, and all snapshots are encrypted.
                            </p>
                            <div className="flex gap-4">
                                <span className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-600">Encrypted Snapshots</span>
                                <span className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-600">Zero Recording</span>
                            </div>
                        </div>

                        {/* Green AI Card */}
                        <div className="bg-emerald-50 rounded-[2.5rem] p-10 md:p-16 border border-emerald-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Leaf className="w-12 h-12 text-emerald-600/20" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-6">Sustainable Learning.</h2>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                Our "Green AI" initiative focuses on optimizing model efficiency to reduce the carbon footprint of AI tutoring. Sustainable technology for a smarter, greener future.
                            </p>
                            <div className="flex gap-4">
                                <span className="px-4 py-2 bg-emerald-100 rounded-full text-xs font-bold text-emerald-700">Low-Energy Models</span>
                                <span className="px-4 py-2 bg-emerald-100 rounded-full text-xs font-bold text-emerald-700">Eco-Friendly Tech</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-4 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Common Questions</h2>
                        <p className="text-slate-500 font-medium">Everything you need to know about your new AI tutor.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
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

                {/* CTA */}
                <section className="max-w-5xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-[#0ea5e9] to-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm -z-10" />
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to start <br /> learning?</h2>
                        <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium">
                            Experience the world's most advanced real-time AI tutor today. Free to get started.
                        </p>
                        <button 
                            onClick={onOpenDownload}
                            className="px-10 py-5 bg-white text-[#0ea5e9] font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xl"
                        >
                            Get Viszmo Now
                        </button>
                    </div>
                </section>

                {/* Internal Links */}
                <div className="mt-32 pt-16 border-t border-slate-100 text-center">
                    <div className="flex justify-center gap-8">
                        <button onClick={() => navigate('/study-overlay')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Study Overlay</button>
                        <button onClick={() => navigate('/how-it-works')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">How It Works</button>
                        <button onClick={() => navigate('/viszmo-vs-quizlet')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">Viszmo vs Quizlet</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
