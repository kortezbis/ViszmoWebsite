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

            <main className="flex-1 relative pt-24">

                <Pricing />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
                    <PricingFAQ />
                </div>

                {/* Bottom Fade Wrapper */}
                <div className="relative isolate mt-auto w-full">
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#d6dee8] -z-10 pointer-events-none" />
                </div>
            </main>

        </motion.div>
    );
};
