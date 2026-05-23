import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    CheckCircle2, 
    ArrowRight,
    HelpCircle,
    Plus,
    Calculator,
    Brain,
    GraduationCap,
    Eye,
    ListChecks,
    Activity
} from 'lucide-react';
import { SEO } from '../dashboard/components/SEO';
import { DownloadCtaButton, useDesktopDownloadLabel } from '../components/DownloadCtaButton';
import { useNavigate } from 'react-router-dom';

const subjects = [
    { name: "Algebra & Pre-Algebra", icon: <Brain className="w-5 h-5 text-blue-500" />, desc: "Linear equations, quadratics, polynomials, inequalities, and system of equations." },
    { name: "Geometry & Trigonometry", icon: <Eye className="w-5 h-5 text-purple-500" />, desc: "Proofs, theorems, angles, coordinate systems, identities, and triangle metrics." },
    { name: "Calculus (AB, BC & College)", icon: <Activity className="w-5 h-5 text-emerald-500" />, desc: "Limits, derivatives, integration, optimization, and infinite series." },
    { name: "Statistics & Probability", icon: <ListChecks className="w-5 h-5 text-amber-500" />, desc: "Distributions, regression, hypothesis testing, permutations, and combinatorics." },
];

const scenarios = [
    {
        title: "Stuck on an Algebra Equation?",
        desc: "Don't just look at a final answer. Viszmo shows you exactly which algebraic laws (like factoring or quadratic formulas) to apply and explains the step-by-step transformations.",
        badge: "Algebra Basics"
    },
    {
        title: "Solving a Geometry Proof?",
        desc: "Geometry proofs can be extremely tedious. Viszmo analyzes the shape or theorem diagram on your screen and lists the exact postulates and definitions needed to write the proof.",
        badge: "Geometry Proofs"
    },
    {
        title: "Checking Calculus Homework?",
        desc: "Integrating a complex function or calculating derivatives? Viszmo walks you through each calculus method (like chain rule or integration by parts) so you learn the logic.",
        badge: "Advanced Calculus"
    }
];

const faqs = [
    {
        q: "How does Viszmo read math equations directly from my screen?",
        a: "Viszmo uses state-of-the-art optical and mathematical recognition models. You simply activate the overlay, drag a selection box over any equation or problem—whether in a PDF textbook, video, web page, or document—and it instantly parses the symbols and text."
    },
    {
        q: "Why is Viszmo better than a standard graphing calculator?",
        a: "Calculators are great for crunching numbers, but they don't teach you how to get the result. Viszmo focuses on the explanation: it breaks down the logic, points out which math formulas and rules apply, and provides high-quality step-by-step tutoring so you learn how to solve it yourself."
    },
    {
        q: "What areas of mathematics are covered?",
        a: "We cover pre-algebra, algebra 1 & 2, geometry, trigonometry, precalculus, AP/College calculus, and introductory to advanced statistics."
    },
    {
        q: "Can it read math diagrams and coordinate graphs?",
        a: "Yes! Unlike old-school math solvers that only read text, Viszmo's advanced vision algorithms can analyze geometry diagrams, coordinate graphs, charts, and coordinate shapes on your screen."
    },
    {
        q: "Does Viszmo explain advanced college-level math?",
        a: "Yes, Viszmo is built to handle advanced mathematics. It effortlessly explains college-level calculus (limits, integrations, differential equations) and statistics logic."
    },
    {
        q: "Does it support LaTeX and mathematical notation?",
        a: "Yes. Viszmo prints its step-by-step solutions using beautiful, clear mathematical notation and LaTeX structure, making it extremely easy to read complex fractions, integrals, and matrices."
    },
    {
        q: "Is there a limit to how many math problems I can solve?",
        a: "Our free tier includes a daily allocation of AI math-solving queries. If you have intensive study needs or want unlimited, fast step-by-step solutions, you can upgrade to Viszmo Pro."
    },
    {
        q: "Can I use Viszmo on online homework portals like MyMathLab or WebAssign?",
        a: "Yes! Because the Viszmo transparent study overlay runs on top of your OS desktop, it works seamlessly with any online portal, digital textbook, web browser, or digital canvas."
    }
];

export const AIMathSolverPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
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
                title="AI Math Solver — Solve Any Math Problem Instantly | Viszmo" 
                description="Viszmo solves any math problem live on your screen. Step by step answers for algebra, geometry, calculus and more — for high school and college students." 
                canonicalUrl="https://www.viszmo.com/ai-math-solver"
                noindex={false} 
            />

            <main className="relative pt-24 pb-32 overflow-hidden">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24 relative">
                    <div className="absolute top-20 left-10 hidden lg:block opacity-20">
                        <Calculator className="w-12 h-12 text-[#0ea5e9]" />
                    </div>
                    <div className="absolute bottom-40 right-20 hidden lg:block opacity-20">
                        <Brain className="w-10 h-10 text-purple-500" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-purple-50 border border-purple-100">
                            <Calculator className="w-4 h-4 text-purple-600 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Visual Math Solver</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                            Solve Any Math <br />
                            Problem Without <br />
                            <span className="text-[#0ea5e9]">Leaving Your Screen.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Don't stress over complex calculations. Viszmo reads graphs, shapes, and complex mathematical formulas directly on your screen and explains them step by step.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper scale-110">
                                <DownloadCtaButton onClick={onOpenDownload} variant="try-free" />
                            </div>
                            <button 
                                onClick={() => navigate('/ai-homework-helper')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                How We Help With Homework <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Why It Beats a Calculator */}
                <section className="py-24 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                                <div className="aspect-video bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-purple-500/5 group-hover:scale-110 transition-transform duration-700" />
                                    <ListChecks className="w-16 h-16 text-purple-500 mb-4" />
                                    <h4 className="text-lg font-bold text-slate-900 relative z-10">Step-By-Step Logic</h4>
                                    <p className="text-xs text-slate-400 max-w-xs mt-2 relative z-10">We show each algebraic and mathematical transformation with its corresponding rule, ensuring you learn.</p>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Why Viszmo Beats a Simple Calculator.</h2>
                                <p className="text-lg text-slate-500 leading-relaxed mb-8 font-medium">
                                    A simple calculator only gives you a number. Viszmo shows you the logic behind the number, helping you prep for exams and learn formulas deeply.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Visual recognition of shapes, charts, and diagrams on-screen",
                                        "Detailed step-by-step calculus, statistics, and algebraic derivations",
                                        "Identifies exact math theorems and laws applied at each step",
                                        "Displays formulas in high-quality, easy-to-read mathematical layout"
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

                {/* Example Scenarios */}
                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Step-by-step math breakdowns.</h2>
                        <p className="text-slate-500 font-medium text-lg">See how Viszmo solves complex math equations live on screen.</p>
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

                {/* Math Subjects Covered */}
                <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
                    <div className="max-w-7xl mx-auto px-8 lg:px-24">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-16 tracking-tight text-center">Every math subject, completely covered.</h2>
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
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Math Solver FAQ</h2>
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

                {/* CTA Section */}
                <section className="py-32 px-4 text-center">
                    <div className="max-w-4xl mx-auto bg-blue-50 rounded-[4rem] p-16 md:p-24 border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 p-8 opacity-20">
                            <Sparkles className="w-16 h-16 text-[#0ea5e9]" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">Try Viszmo Free</h2>
                        <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto font-medium">
                            Math Help On Screen. Download the overlay today and start learning step-by-step.
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
                        <button onClick={() => navigate('/ai-homework-helper')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">AI Homework Helper</button>
                        <button onClick={() => navigate('/ai-study-assistant')} className="text-slate-400 hover:text-[#0ea5e9] font-bold transition-colors">AI Study Assistant</button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};
