import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, X, Check, Mail } from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, initialView = 'login' }: AuthModalProps) => {
    const [view, setView] = useState<'login' | 'signup'>(initialView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { isSignedIn } = useAuth();

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError('');
            setSuccess(false);
            setLoading(false);
        }
    }, [isOpen, initialView]);

    // Close if signed in
    useEffect(() => {
        if (isSignedIn && isOpen) {
            onClose();
        }
    }, [isSignedIn, isOpen, onClose]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (view === 'signup') {
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
            } else {
                const { data: session } = await supabase.auth.getSession();
                if (session.session) {
                    onClose();
                } else {
                    setSuccess(true);
                    setLoading(false);
                }
            }
        } else {
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) {
                setError(authError.message);
                setLoading(false);
            } else {
                onClose();
            }
        }
    };

    const handleSocialAuth = async (provider: 'google' | 'apple') => {
        setError('');
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                    queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined,
                    scopes: provider === 'apple' ? 'email name' : undefined
                },
            });
            if (authError) throw authError;
        } catch (err: any) {
            setError(err.message || `Error initiating ${provider} login`);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-[800px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100"
                    >
                        {/* Left Side: Branding/Info (Desktop Only) */}
                        <div className="hidden md:flex md:w-[35%] bg-slate-50 p-10 flex-col justify-between border-r border-slate-100">
                            <div className="relative z-10">
                                <div className="mb-10">
                                    <div className="[filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1583%)_hue-rotate(169deg)_brightness(98%)_contrast(93%)]">
                                        <Logo variant="icon" size={40} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                            <Check className="text-[#0ea5e9] w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-bold text-xs">Study Smart</div>
                                            <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">Flashcards and AI drills.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                            <Check className="text-[#0ea5e9] w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-bold text-xs">AI Assistant</div>
                                            <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">Instant study insights.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                            <Check className="text-[#0ea5e9] w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-bold text-xs">Live Dashboard</div>
                                            <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">Track your mastery.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">200,000+ Students</div>
                            </div>
                        </div>

                        {/* Right Side: Auth Form */}
                        <div className="flex-1 p-8 md:p-14 relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-8 z-10 p-2 text-slate-300 hover:text-slate-600 transition-colors bg-slate-50/50 hover:bg-slate-100/50 rounded-full"
                            >
                                <X size={20} />
                            </button>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-10"
                                >
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                        <Mail className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Verify your email</h2>
                                    <p className="text-slate-500 font-medium mb-8 max-w-sm">
                                        We sent a confirmation link to <br/>
                                        <span className="text-slate-900 font-bold">{email}</span>
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="w-full max-w-[320px] py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                    >
                                        Got it
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-10 text-center">
                                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                                            {view === 'login' ? 'Welcome back' : 'Create account'}
                                        </h2>
                                        <p className="text-slate-500 font-medium text-lg">
                                            {view === 'login' 
                                                ? 'Log in to continue your progress.' 
                                                : 'Start your study journey today.'}
                                        </p>
                                    </div>

                                    {/* Social Auth */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <button
                                            onClick={() => handleSocialAuth('google')}
                                            className="flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm shadow-sm"
                                        >
                                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                            <span>Google</span>
                                        </button>
                                        <button
                                            onClick={() => handleSocialAuth('apple')}
                                            className="flex items-center justify-center gap-3 py-4 px-4 rounded-2xl bg-black hover:bg-slate-900 transition-all font-bold text-white text-sm shadow-lg shadow-slate-200"
                                        >
                                            <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current">
                                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                            </svg>
                                            <span>Apple</span>
                                        </button>
                                    </div>

                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-100" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or continue with email</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleEmailAuth} className="space-y-5">
                                        {view === 'signup' && (
                                            <div>
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={e => setFullName(e.target.value)}
                                                    required
                                                    placeholder="Jane Smith"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]/20 focus:outline-none transition-all"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                                placeholder="you@example.com"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]/20 focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2 ml-1">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Password</label>
                                                {view === 'login' && (
                                                    <button type="button" className="text-[11px] font-bold text-[#0ea5e9] hover:underline">Forgot password?</button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    placeholder="min. 6 characters"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]/20 focus:outline-none transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-red-50 rounded-2xl border border-red-100"
                                            >
                                                <p className="text-xs text-red-600 font-bold leading-relaxed">{error}</p>
                                            </motion.div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-blue-100 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                                        >
                                            {loading && <Loader2 size={24} className="animate-spin" />}
                                            {view === 'login' ? 'Sign In' : 'Create Account'}
                                        </button>
                                    </form>

                                    <div className="mt-10 text-center">
                                        <p className="text-sm text-slate-500 font-bold">
                                            {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                                            <button
                                                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                                className="text-[#0ea5e9] hover:underline"
                                            >
                                                {view === 'login' ? 'Sign up for free' : 'Log in here'}
                                            </button>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
