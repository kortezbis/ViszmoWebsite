import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface StaticPageLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export const StaticPageLayout = ({ title, subtitle, children }: StaticPageLayoutProps) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col">
            <Navbar onOpenModal={() => navigate('/pricing')} />

            <main className="flex-1 relative pt-32 flex flex-col">
                {/* Background (Shared) */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
                    <div className="absolute inset-0 bg-[#ffffff]" />
                    <div
                        className="absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/5 blur-[120px]" />
                    <div className="absolute top-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-slate-500/5 blur-[120px]" />
                </div>

                <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 relative z-10 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>

                    <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm text-slate-600 space-y-8 leading-relaxed">
                        {children}
                    </div>
                </div>

                {/* Bottom Fade Wrapper */}
                <div className="relative isolate w-full h-64 mt-auto">
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-b from-transparent to-[#d6dee8] -z-10 pointer-events-none" />
                </div>
            </main>

            <Footer onOpenModal={() => navigate('/pricing')} />
        </div>
    );
};
