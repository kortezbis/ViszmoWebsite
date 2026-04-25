import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DownloadAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DownloadAppModal = ({ isOpen, onClose }: DownloadAppModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-900/10 flex flex-col items-center text-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Get the iOS app</h2>
                            <p className="text-slate-500 font-medium">Available on the App Store</p>
                        </div>

                        {/* QR Code Placeholder */}
                        <div className="relative mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 group transition-all">
                            {/* Placeholder QR Design */}
                            <div className="w-48 h-48 relative flex items-center justify-center">
                                {/* Using an external API for a real-looking QR placeholder */}
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://viszmo.com" 
                                    alt="QR Code" 
                                    className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                
                                {/* Center Icon Placeholder (Star like in image) */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-400 fill-current">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Instruction */}
                        <p className="text-slate-500 font-semibold text-sm">
                            Point your phone's camera at the QR code
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
