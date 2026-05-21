import { useState, useEffect } from 'react';
import { isApplePlatformClient } from '../lib/previewMode';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Send, X, Check } from 'lucide-react';
import { AppleLogoIcon, WindowsTileIcon } from './PlatformDownloadIcons';
import { sendDownloadLinkEmail } from '../services/sendDownloadLinkEmail';
import { supabase } from '../lib/supabase';

interface DesktopDownloadLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Called after an email is sent successfully (e.g. mark first-visit prompt complete). */
    onSentSuccess?: () => void;
}

function defaultModalPlatform(): 'windows' | 'mac' {
    return isApplePlatformClient() ? 'mac' : 'windows';
}

export function DesktopDownloadLinkModal({ isOpen, onClose, onSentSuccess }: DesktopDownloadLinkModalProps) {
    const { isApplePlatform } = usePreviewMode();
    const [platform, setPlatform] = useState<'windows' | 'mac'>(defaultModalPlatform);
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const resetFeedback = () => {
        setFormError(null);
        setSent(false);
    };

    useEffect(() => {
        if (isOpen) {
            setPlatform(defaultModalPlatform());
            resetFeedback();
        }
    }, [isOpen, isApplePlatform]);

    const handleSend = async () => {
        resetFeedback();
        const trimmed = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setFormError('Enter a valid email address.');
            return;
        }
        setSending(true);
        try {
            if (platform === 'mac') {
                const { error: dbError } = await supabase
                    .from('mac_waitlist')
                    .insert([{ email: trimmed }]);

                if (dbError && !dbError.message.includes('unique')) {
                    console.error('Waitlist DB Error:', dbError);
                }

                await sendDownloadLinkEmail(trimmed, 'mac-waitlist');
            } else {
                await sendDownloadLinkEmail(trimmed, 'desktop');
            }

            setSent(true);
            onSentSuccess?.();
        } catch (e) {
            const raw = e instanceof Error ? e.message : 'Something went wrong.';
            const hint =
                /domain|verify|resend|from address|not allowed/i.test(raw)
                    ? ' Ask your admin to verify the sender domain in Resend and set RESEND_FROM + RESEND_API_KEY in Supabase Edge Function secrets.'
                    : '';
            setFormError(`${raw}${hint}`);
        } finally {
            setSending(false);
        }
    };

    const isWindows = platform === 'windows';

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
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-900/10 flex flex-col items-center text-center max-h-[min(90vh,720px)] overflow-y-auto"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {sent ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
                                    className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-sm mt-2"
                                >
                                    <Check className="w-10 h-10 text-emerald-500" strokeWidth={3} />
                                </motion.div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">
                                    {isWindows ? 'Email sent!' : "You're on the list!"}
                                </h2>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[300px] mb-8">
                                    {isWindows
                                        ? `Check your inbox at ${email} for the download link.`
                                        : `We've added ${email} to our Mac waitlist. We'll notify you when macOS launches.`}
                                </p>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm py-3.5 px-4 shadow-lg shadow-sky-500/20 transition-colors"
                                >
                                    Done
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mb-6 mt-2">
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                                        {isWindows ? 'Send download link' : 'Mac coming soon'}
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        {isWindows
                                            ? 'Get Viszmo on your computer'
                                            : 'Join the macOS waitlist'}
                                    </p>
                                </div>

                                <p className="text-slate-500 font-semibold text-sm mb-6 max-w-[320px]">
                                    {isWindows
                                        ? "We'll email you a link to install when you're back on your computer."
                                        : 'Enter your email to get early access when the Mac app launches.'}
                                </p>

                                <div className="w-full flex p-1 mb-6 rounded-xl bg-slate-100 border border-slate-200/50">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPlatform('windows');
                                            resetFeedback();
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                                            isWindows
                                                ? 'bg-white text-[#0ea5e9] shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <WindowsTileIcon className="w-3.5 h-3.5 shrink-0" size={14} />
                                        Windows
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPlatform('mac');
                                            resetFeedback();
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                                            !isWindows
                                                ? 'bg-white text-[#0ea5e9] shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <AppleLogoIcon className="w-3.5 h-3.5 shrink-0" size={14} />
                                        macOS
                                    </button>
                                </div>

                                <div className="w-full text-left">
                                    <label
                                        className="block text-xs font-bold text-slate-600 mb-1.5"
                                        htmlFor="desktop-link-email"
                                    >
                                        Email address
                                    </label>
                                    <div className="relative mb-3">
                                        <Mail
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                                            aria-hidden
                                        />
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
                                        <p className="text-xs text-red-600 font-semibold mb-3">{formError}</p>
                                    ) : null}

                                    <button
                                        type="button"
                                        disabled={sending}
                                        onClick={() => void handleSend()}
                                        className="w-full rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm py-3.5 px-4 shadow-lg shadow-sky-500/20 transition-colors disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                        ) : (
                                            <Send className="w-4 h-4" aria-hidden />
                                        )}
                                        {isWindows ? 'Send download link' : 'Join Mac waitlist'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="mt-4 w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
