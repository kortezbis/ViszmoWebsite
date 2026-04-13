import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/account`,
        });

        if (authError) {
            setError(authError.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute inset-0 bg-[#ffffff]" />
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-50/5 blur-[100px]" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[420px] flex flex-col items-center"
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 [filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1583%)_hue-rotate(169deg)_brightness(98%)_contrast(93%)]">
                                <img src="/favicon-32x32.png.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-black text-slate-900">Viszmo</span>
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Forgot password?</h1>
                        <p className="text-slate-500 font-medium max-w-[300px]">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    {/* Card */}
                    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8">
                        {success ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-[#0ea5e9]" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 mb-2">Check your email</h2>
                                <p className="text-slate-500 text-sm mb-6">
                                    We sent a password reset link to <strong>{email}</strong>.
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="text-sm font-bold text-[#0ea5e9] hover:underline"
                                >
                                    Didn't get an email? Try again
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleReset} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-500 font-medium bg-red-50 rounded-xl px-4 py-3">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-100 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    Reset Password
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 font-bold hover:text-slate-800 transition-colors">
                            <ArrowLeft size={16} />
                            Back to sign in
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
