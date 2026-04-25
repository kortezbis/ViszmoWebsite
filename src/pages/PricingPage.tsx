import { Pricing } from '../components/Pricing';
import { PricingFAQ } from '../components/PricingFAQ';
import { motion } from 'framer-motion';
export const PricingPage = ({ onOpenDownload }: { onOpenDownload?: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col"
        >

            <main className="flex-1 relative pt-24 overflow-hidden">
                {/* Blur Overlay */}
                <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-0" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-[3rem] p-12 md:p-20 text-center max-w-lg"
                    >
                        <div className="w-20 h-20 bg-[#0ea5e9]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <span className="text-4xl">🚀</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Pricing <span className="text-[#0ea5e9]">Soon</span>
                        </h2>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                            We're currently finalizing our subscription plans to give you the best possible value. Stay tuned for the launch!
                        </p>
                        <div className="btn-wrapper opacity-50 cursor-not-allowed">
                            <button className="btn cursor-not-allowed" disabled>
                                <span className="btn-text">Coming Soon</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="opacity-40 blur-lg pointer-events-none transition-all duration-700">
                    <Pricing />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
                        <PricingFAQ />
                    </div>
                </div>

                {/* Bottom Fade Wrapper */}
                <div className="relative isolate mt-auto w-full">
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#d6dee8] -z-10 pointer-events-none" />
                </div>
            </main>

        </motion.div>
    );
};
