import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSuccess(true);

        // Auto-close after success (optional)
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    return (
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
                            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            <div className="p-8">
                                {!success ? (
                                    <>
                                        <div className="text-center mb-8">
                                            <div className="flex justify-center mb-6">
                                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
                                                    <svg className="w-8 h-8 text-[#0ea5e9]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="currentColor">
                                                        <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Get Viszmo for Windows</h2>
                                            <p className="text-slate-500 text-base leading-relaxed">
                                                Enter your email to receive the download link and get started with your private desktop assistant.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                                                    placeholder="your.email@example.com"
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            {error && (
                                                <p className="text-red-500 text-xs font-semibold">{error}</p>
                                            )}

                                            <div className="pt-2">
                                                <div className="btn-wrapper w-full">
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="btn w-full justify-center"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                                <span className="btn-text">Sending...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="currentColor">
                                                                    <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                                                                </svg>
                                                                <span className="btn-text">Get Download Link</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 bg-[#0ea5e9]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-8 h-8 text-[#0ea5e9]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email!</h3>
                                        <p className="text-slate-500 text-sm">
                                            We've sent the download link to <span className="font-semibold text-slate-900">{email}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

