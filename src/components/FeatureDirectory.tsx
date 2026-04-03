import { motion } from 'framer-motion';
import {
    Zap,
    Shield,
    Layout,
    Cpu,
    MousePointer2,
    EyeOff,
    Search,
    MessageSquare,
    FileText,
    Clock,
    Sparkles,
    Layers
} from 'lucide-react';

const FEATURE_CATEGORIES = [
    {
        title: "Core Assistant",
        features: [
            { name: "Invisible Overlay", icon: EyeOff, desc: "Floating assistance that's 100% invisible to screen share and recording." },
            { name: "Click-Through", icon: MousePointer2, desc: "Interact with apps behind the overlay without moving it." },
            { name: "Context Aware", icon: Cpu, desc: "Our OCR reads your screen 60x per second to keep help relevant." },
            { name: "Global Shortcuts", icon: Zap, desc: "Instant hide (Ctrl+Shift+H) and scan (Ctrl+Shift+Q) commands." },
        ]
    },
    {
        title: "Study Tools",
        features: [
            { name: "Smart Flashcards", icon: Layers, desc: "Auto-generate flashcards from any document or video." },
            { name: "Live Chat", icon: MessageSquare, desc: "Ask the AI follow-up questions about your study material." },
            { name: "Exam Mode", icon: Shield, desc: "Locked-down safe assistance for high-stakes environments." },
            { name: "Fast Search", icon: Search, desc: "Instantly find definitions and references across your library." },
        ]
    },
    {
        title: "Learning Engine",
        features: [
            { name: "Document Bridge", icon: FileText, desc: "Import any PDF, PPT, or Word doc into your study hub." },
            { name: "Live Recording", icon: Clock, desc: "Transcribe lectures in real-time with speaker identification." },
            { name: "AI Summaries", icon: Sparkles, desc: "Concise, actionable summaries of long lectures and readings." },
            { name: "Multi-Platform", icon: Layout, desc: "Works across Canvas, Honorlock, Blackboard, and more." },
        ]
    }
];

export const FeatureDirectory = () => {
    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">The Toolset</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Everything you need to <span className="text-[#0ea5e9]">study smarter.</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {FEATURE_CATEGORIES.map((category, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-10"
                        >
                            <h4 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center justify-between">
                                {category.title}
                                <span className="text-xs font-black text-slate-300 font-mono">0{idx + 1}</span>
                            </h4>

                            <div className="space-y-8">
                                {category.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="group flex gap-5">
                                        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0ea5e9] group-hover:bg-sky-50 group-hover:border-sky-100 transition-all duration-300">
                                            <feature.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#0ea5e9] transition-colors">{feature.name}</h5>
                                            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA or Metrics */}
                <div className="mt-32 pt-16 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Active Users", value: "200k+" },
                        { label: "AI Scans", value: "1.2M+" },
                        { label: "Data Safety", value: "AES-256" },
                        { label: "Uptime", value: "99.9%" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center md:text-left">
                            <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
