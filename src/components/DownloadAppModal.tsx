import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IOS_APP_QR_IMAGE_PATH, IOS_APP_STORE_URL } from '../constants/downloads';

interface DownloadAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DownloadAppModal = ({ isOpen, onClose }: DownloadAppModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-900/10 flex flex-col items-center text-center"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Get the iOS app</h2>
                            <p className="text-slate-500 font-medium">Available on the App Store</p>
                        </div>

                        <a
                            href={IOS_APP_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative mb-6 group transition-all w-full flex justify-center rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/40"
                            aria-label="Open Viszmo on the App Store"
                        >
                            <div className="w-52 h-52 relative flex items-center justify-center p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <img
                                    src={IOS_APP_QR_IMAGE_PATH}
                                    alt="QR code to download Viszmo on the App Store"
                                    width={512}
                                    height={512}
                                    className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </a>

                        <p className="text-slate-500 font-semibold text-sm mb-2">
                            Point your phone&apos;s camera at the QR code
                        </p>
                        <a
                            href={IOS_APP_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#0ea5e9] hover:underline"
                        >
                            Open in App Store
                        </a>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
