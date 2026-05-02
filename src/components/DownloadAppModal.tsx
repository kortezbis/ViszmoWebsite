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

                        {/* QR Code */}
                        <div className="relative mb-8 group transition-all">
                            <div className="w-56 h-56 relative flex items-center justify-center">
                                <img 
                                    src="/viszmo-QRcode.jpg" 
                                    alt="Viszmo QR Code" 
                                    className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                />
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
