import React from 'react';
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col"
        >

            <main className="flex-1 relative pt-32 flex flex-col">

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

        </motion.div>
    );
};
