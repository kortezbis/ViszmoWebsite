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
            className="flex-1 flex flex-col bg-white selection:bg-[#0ea5e9]/10"
        >
            <div className="flex-1 relative pt-24">
                <div className="transition-all duration-700">
                    <Pricing />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
                        <PricingFAQ />
                    </div>
                </div>

                {/* Bottom Fade Transition - Integrated into the container but above the blur if needed */}
                <div className="relative isolate w-full h-64 mt-auto pointer-events-none">
                    <div
                        className="absolute inset-0 opacity-[0.03] -z-20"
                        style={{
                            backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                            backgroundSize: '24px 24px',
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)'
                        }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-b from-transparent to-[#d6dee8] -z-10" />
                </div>
            </div>
        </motion.div>
    );
};
