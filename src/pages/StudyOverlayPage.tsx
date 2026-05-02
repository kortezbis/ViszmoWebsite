import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Download, 
    Zap, 
    Shield, 
    ChevronDown, 
    Youtube, 
    FileText, 
    Globe, 
    Mic,
    ArrowRight,
    Search,
    MessageSquare,
    Eye,
    Sparkles,
    CheckCircle2,
    Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Head Component for SEO
 */
const Head = ({ title, description, canonical }: { title: string; description: string; canonical: string }) => {
    useEffect(() => {
        document.title = title;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            (metaDesc as HTMLMetaElement).name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', description);

        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            (linkCanonical as HTMLLinkElement).rel = 'canonical';
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonical);
    }, [title, description, canonical]);

    return null;
};

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => {
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={onClick}
                className="w-full text-left py-6 flex items-start justify-between gap-4 group"
            >
                <h3 className={`text-lg md:text-xl font-bold transition-colors flex-1 ${isOpen ? 'text-[#0ea5e9]' : 'text-slate-900'}`}>
                    {question}
                </h3>
                <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 mt-1 transition-all duration-300 ${isOpen ? 'rotate-180 text-[#0ea5e9]' : 'text-slate-300'}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="text-slate-500 text-lg leading-relaxed pb-8 pr-12 font-medium">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const StudyOverlayPage = () => {
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const steps = [
        {
            icon: <Download className="w-10 h-10 text-blue-500" />,
            title: "Download & Install",
            description: "Get Viszmo for Windows. Installation takes less than a minute. Your AI sidekick is ready to go immediately."
        },
        {
            icon: <Zap className="w-10 h-10 text-indigo-500" />,
            title: "Launch the Overlay",
            description: "Hit 'Start Session' and the transparent overlay appears. It floats seamlessly over any app or video player."
        },
        {
            icon: <Search className="w-10 h-10 text-emerald-500" />,
            title: "Analyze Anything",
            description: "Click 'Scan' to let the AI read your screen. It recognizes text, complex math, and even visual diagrams."
        },
        {
            icon: <MessageSquare className="w-10 h-10 text-purple-500" />,
            title: "Learn Instantly",
            description: "Get detailed explanations and step-by-step solutions. Save everything to your dashboard for later review."
        }
    ];

    const platformIcons = [
        { icon: <Youtube />, name: "YouTube" },
        { icon: <FileText />, name: "PDFs" },
        { icon: <Globe />, name: "Websites" },
        { icon: <Mic />, name: "Lectures" }
    ];

    const faqs = [
        {
            question: "Does the overlay work with any video player?",
            answer: "Yes! Viszmo's study overlay is designed to float on top of any application, including web browsers (YouTube, Canvas), video players (Panopto, VLC), and even communication apps like Zoom or Teams."
        },
        {
            question: "How do I summon the overlay while in full-screen mode?",
            answer: "You can use the universal hotkey (Ctrl + Shift + Space) to instantly show or hide the overlay, even if you're in a full-screen video or document."
        },
        {
            question: "Can the AI see my entire screen or just a specific area?",
            answer: "By default, Viszmo only sees what you explicitly ask it to 'Scan'. You can select a specific region or the entire active window."
        },
        {
            question: "Does it work on Mac and Windows?",
            answer: "Currently, Viszmo is available for Windows 10 & 11. We are actively developing the Mac version and will announce it soon."
        },
        {
            question: "Can I use it for live exams or proctored tests?",
            answer: "Viszmo is intended as a study aid to help you learn. Always check your institution's academic integrity policies regarding AI tools."
        },
        {
            question: "How does it help with math and complex diagrams?",
            answer: "Our vision AI recognizes mathematical notation and complex diagrams, providing logic-based explanations rather than just answers."
        },
        {
            question: "Is there a way to save the answers for later?",
            answer: "Every interaction is synced to your Dashboard. You can turn AI explanations into flashcards or notes with a single click."
        },
        {
            question: "Does it work offline?",
            answer: "An internet connection is required to access our AI models, but you can view your saved materials offline in the dashboard."
        }
    ];

    return (
        <article className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#0ea5e9]/10">
            <Head 
                title="Live AI Study Overlay — Get Answers on Screen While You Learn | Viszmo"
                description="Viszmo's study overlay sits on top of any app, website, or video. Ask questions live and get instant AI answers without switching tabs. The future of studying is here."
                canonical="https://www.viszmo.com/study-overlay"
            />

            {/* --- Hero Section --- */}
            <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                            Your live study <br />
                            <span className="text-[#0ea5e9]">sidekick.</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
                            An AI study overlay that lives on your screen. Ask questions, get explanations, and take perfect notes—all without switching tabs.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="btn-wrapper">
                                <button className="btn" onClick={() => navigate('/dashboard')}>
                                    <span className="btn-text">Go to Dashboard</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate('/how-it-works')}
                                className="flex items-center gap-2 text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                See how it works <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- What is Section --- */}
            <section className="py-24 md:py-32 px-4 bg-slate-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                                What is a <br /> Study Overlay?
                            </h2>
                            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                                It's a transparent, intelligent layer that stays on top of your work. Whether you're watching a lecture on YouTube or reading a PDF, Viszmo is there to help.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                {[
                                    "Sees what you see",
                                    "Instant AI answers",
                                    "Stays on top",
                                    "Hotkey controlled"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="aspect-video bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative p-4 group">
                                <div className="absolute inset-0 bg-slate-50 opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="relative h-full w-full rounded-2xl bg-slate-200 animate-pulse flex items-center justify-center">
                                    <Sparkles className="w-12 h-12 text-slate-300" />
                                </div>
                                {/* Mock Overlay UI */}
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-8 right-8 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-100"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-6 h-6 bg-[#0ea5e9] rounded-md" />
                                        <div className="h-2 w-20 bg-slate-200 rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                                        <div className="h-1.5 w-2/3 bg-slate-100 rounded-full" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- How It Works Section --- */}
            <section className="py-24 md:py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">How it works</h2>
                        <p className="text-xl text-slate-500 font-medium">Four simple steps to mastery.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {steps.map((step, i) => (
                            <div key={i} className="flex flex-col gap-6">
                                <div className="p-4 bg-slate-50 rounded-2xl w-fit border border-slate-100">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Platforms Section --- */}
            <section className="py-24 md:py-32 px-4 bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black mb-16 tracking-tight">Works on any platform</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {platformIcons.map((platform, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 group">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-[#0ea5e9] group-hover:scale-110 transition-all duration-300">
                                    {React.cloneElement(platform.icon as React.ReactElement, { className: "w-8 h-8" })}
                                </div>
                                <span className="font-bold text-white/70 group-hover:text-white transition-colors">{platform.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Why It Beats Tabs --- */}
            <section className="py-24 md:py-32 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 space-y-12">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                                Stop switching <br /> tabs.
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { title: "Stay Focused", desc: "No context switching means you retain more information and stay in the flow longer." },
                                    { title: "Direct Interaction", desc: "Ask about what you see. The AI has visual context, so you don't have to explain yourself." },
                                    { title: "Seamless Sync", desc: "Your overlay sessions sync instantly to your dashboard as flashcards and study guides." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                             <div className="bg-slate-100 aspect-square rounded-[3rem] p-10 flex items-center justify-center">
                                <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl flex items-center justify-center border border-slate-200">
                                    <Monitor className="w-20 h-20 text-slate-200" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Privacy Section --- */}
            <section className="py-24 md:py-32 px-4 bg-slate-50/50">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-100 mb-8">
                        <Shield className="w-12 h-12 text-[#0ea5e9]" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Your privacy, first.</h2>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto mb-12">
                        Viszmo only sees what you explicitly scan. We don't record your screen in the background, and we never share your private data.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="px-6 py-3 bg-white rounded-full border border-slate-200 font-bold text-slate-600 text-sm">On-Demand Only</div>
                        <div className="px-6 py-3 bg-white rounded-full border border-slate-200 font-bold text-slate-600 text-sm">Zero Data Sales</div>
                        <div className="px-6 py-3 bg-white rounded-full border border-slate-200 font-bold text-slate-600 text-sm">Secure Processing</div>
                    </div>
                </div>
            </section>

            {/* --- FAQ Section --- */}
            <section className="py-24 md:py-32 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Got Questions?</h2>
                        <p className="text-xl text-slate-500 font-medium">Everything you need to know about the overlay.</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {faqs.map((faq, i) => (
                            <FAQItem 
                                key={i}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFaqIndex === i}
                                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-24 md:py-32 px-4 relative overflow-hidden text-center">
                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">Ready to learn <br /> faster?</h2>
                    <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium">
                        Join 200,000+ students and experience the future of studying today.
                    </p>
                    
                    <div className="flex flex-col items-center gap-8">
                        <div className="btn-wrapper scale-110">
                            <button className="btn" onClick={() => navigate('/dashboard')}>
                                <span className="btn-text">Get Started Now</span>
                            </button>
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">
                            WINDOWS 10 & 11 • SAFE • SECURE
                        </p>
                    </div>
                </div>
            </section>

            {/* Bottom Transition Mesh */}
            <div className="relative isolate h-64 mt-auto pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.03] -z-20"
                    style={{
                        backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white to-[#d6dee8] -z-10" />
            </div>
        </article>
    );
};
