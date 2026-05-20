import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Monitor, Smartphone, Mail, Send, X } from 'lucide-react';
import { sendDownloadLinkEmail } from '../services/sendDownloadLinkEmail';

interface DesktopDownloadLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DesktopDownloadLinkModal({ isOpen, onClose }: DesktopDownloadLinkModalProps) {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const resetFeedback = () => {
        setFormError(null);
        setSent(false);
    };

    const handleSend = async () => {
        resetFeedback();
        const trimmed = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setFormError('Enter a valid email address.');
            return;
        }
        setSending(true);
        try {
            await sendDownloadLinkEmail(trimmed, 'desktop');
            setSent(true);
            setEmail('');
        } catch (e) {
            setFormError(e instanceof Error ? e.message : 'Something went wrong.');
        } finally {
            setSending(false);
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
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: 'spring', duration: 0.45, bounce: 0.32 }}
                        className="relative w-full max-w-[400px] rounded-[1.75rem] shadow-2xl shadow-slate-900/15 overflow-hidden bg-white max-h-[min(92vh,640px)] flex flex-col"
                    >
                        <div className="relative bg-gradient-to-b from-sky-400 to-[#0ea5e9] px-6 pt-8 pb-10 text-center shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md">
                                <Monitor className="w-8 h-8 text-[#0ea5e9]" strokeWidth={2} />
                            </div>
                            <h2 className="text-xl font-black text-white tracking-tight mb-1">
                                Viszmo is a desktop app
                            </h2>
                            <p className="text-sm font-semibold text-white/90">
                                Available for Windows &amp; Mac computers
                            </p>
                        </div>

                        <div className="px-6 py-6 flex flex-col flex-1 min-h-0 overflow-y-auto">
                            <div className="flex gap-3 rounded-2xl bg-sky-50 border border-sky-100/80 px-4 py-3 mb-5 text-left">
                                <Smartphone className="w-5 h-5 text-[#0ea5e9] shrink-0 mt-0.5" aria-hidden />
                                <p className="text-sm font-semibold text-slate-700 leading-snug">
                                    Want a download link emailed for when you&apos;re on your computer?
                                </p>
                            </div>

                            <label className="block text-xs font-bold text-slate-600 mb-1.5" htmlFor="desktop-link-email">
                                Email address
                            </label>
                            <div className="relative mb-3">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden />
                                <input
                                    id="desktop-link-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        resetFeedback();
                                    }}
                                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                                />
                            </div>

                            {formError ? (
                                <p className="text-xs text-red-600 font-medium mb-3">{formError}</p>
                            ) : null}
                            {sent ? (
                                <p className="text-xs text-emerald-600 font-semibold mb-3">
                                    Check your inbox for the desktop download link.
                                </p>
                            ) : null}

                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => void handleSend()}
                                className="w-full rounded-xl bg-gradient-to-b from-sky-400 to-[#0ea5e9] text-white font-bold text-sm py-3.5 px-4 shadow-lg shadow-sky-500/25 hover:opacity-95 transition-opacity disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                ) : (
                                    <Send className="w-4 h-4" aria-hidden />
                                )}
                                Send download link
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-4 text-center text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
