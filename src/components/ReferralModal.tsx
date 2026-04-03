import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReferralModal = ({ isOpen, onClose }: ReferralModalProps) => {
    const [copied, setCopied] = useState(false);
    const referralLink = "https://www.viszmo.com/sign-up?ref=BC8YVR2G";
    const inputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'; // Prevent content shift
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            <div className="p-8 md:p-10">
                                {/* Header Section */}
                                <div className="mb-8 text-center">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Unlock Bonus Messages</h2>
                                    <p className="text-slate-500 text-lg leading-relaxed">
                                        Share your referral link. They get <span className="font-bold text-[#0ea5e9]">5 bonus messages</span> and you get <span className="font-bold text-[#0ea5e9]">10 extra daily messages</span> instantly.
                                    </p>
                                </div>

                                {/* Link Section */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-xl mx-auto">
                                    <div className="relative flex-grow">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            readOnly
                                            value={referralLink}
                                            className="w-full h-[50px] bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                                        />
                                    </div>

                                    <div className="flex-shrink-0 self-center sm:self-auto">
                                        <div className="explore-btn-wrap" onClick={handleCopy}>
                                            <div className="explore-btn-shadow"></div>
                                            <button className="explore-btn" style={{ minWidth: 'auto', padding: '0 24px', height: '50px' }}>
                                                <span className="!flex items-center gap-2 !text-sm font-bold whitespace-nowrap">
                                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    {copied ? 'COPIED' : 'COPY'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Section */}
                                <div className="flex gap-4">
                                    <div className="flex-1 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/50">
                                        <span className="text-3xl font-bold text-slate-900">0</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Friends Invited</span>
                                    </div>
                                    <div className="flex-1 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/50">
                                        <span className="text-3xl font-bold text-[#0ea5e9]">0</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bonus Earned</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
