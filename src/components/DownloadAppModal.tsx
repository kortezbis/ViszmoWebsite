import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, X } from 'lucide-react';
import { sendDownloadLinkEmail } from '../services/sendDownloadLinkEmail';

interface DownloadAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DownloadAppModal = ({ isOpen, onClose }: DownloadAppModalProps) => {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState<'ios' | 'windows' | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [successKind, setSuccessKind] = useState<'ios' | 'windows' | null>(null);

    const resetFeedback = () => {
        setFormError(null);
        setSuccessKind(null);
    };

    const handleSend = async (product: 'ios' | 'windows') => {
        resetFeedback();
        const trimmed = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setFormError('Enter a valid email address.');
            return;
        }
        setSending(product);
        try {
            await sendDownloadLinkEmail(trimmed, product);
            setSuccessKind(product);
            setEmail('');
        } catch (e) {
            setFormError(e instanceof Error ? e.message : 'Something went wrong.');
        } finally {
            setSending(null);
        }
    };

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
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-900/10 flex flex-col items-center text-center max-h-[min(90vh,720px)] overflow-y-auto"
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

                        <div className="relative mb-6 group transition-all w-full flex justify-center">
                            <div className="w-52 h-52 relative flex items-center justify-center">
                                <img
                                    src="/viszmo-QRcode.jpg"
                                    alt="Viszmo QR Code"
                                    className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>

                        <p className="text-slate-500 font-semibold text-sm mb-8">
                            Point your phone&apos;s camera at the QR code
                        </p>

                        <div className="w-full border-t border-slate-100 pt-8">
                            <div className="flex items-center justify-center gap-2 text-slate-700 font-bold text-sm mb-4">
                                <Mail className="w-4 h-4 text-[#0ea5e9]" aria-hidden />
                                Email yourself the link
                            </div>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                Open the message on your computer to install — handy when you&apos;re on mobile.
                            </p>
                            <label className="sr-only" htmlFor="download-email-self">Email</label>
                            <input
                                id="download-email-self"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); resetFeedback(); }}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] mb-3"
                            />

                            {formError ? (
                                <p className="text-xs text-red-600 font-medium mb-3 text-left">{formError}</p>
                            ) : null}

                            {successKind ? (
                                <p className="text-xs text-emerald-600 font-semibold mb-3">
                                    {successKind === 'ios'
                                        ? 'Check your inbox for the App Store link.'
                                        : 'Check your inbox for the Windows installer link.'}
                                </p>
                            ) : null}

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    disabled={sending !== null}
                                    onClick={() => void handleSend('ios')}
                                    className="w-full rounded-xl bg-[#0ea5e9] text-white font-bold text-sm py-3 px-4 hover:bg-sky-500 transition-colors disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                                >
                                    {sending === 'ios' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                    ) : null}
                                    App Store link
                                </button>
                                <button
                                    type="button"
                                    disabled={sending !== null}
                                    onClick={() => void handleSend('windows')}
                                    className="w-full rounded-xl bg-slate-900 text-white font-bold text-sm py-3 px-4 hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                                >
                                    {sending === 'windows' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                    ) : null}
                                    Windows installer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
