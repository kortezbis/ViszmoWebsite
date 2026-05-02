import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'error'>('idle');

    const { isSignedIn, isLoading: authLoading } = useAuth();

    // Detect errors from OAuth redirects
    useEffect(() => {
        const errorCode = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (errorCode) {
            setError(`${errorCode}: ${errorDescription || 'Authentication failed'}`);
            setAuthStatus('error');
        }
    }, [searchParams]);

    // Redirect if already signed in
    useEffect(() => {
        if (isSignedIn && !authLoading) {
            navigate(redirectTo, { replace: true });
        }
    }, [isSignedIn, authLoading, navigate, redirectTo]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            navigate(redirectTo, { replace: true });
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}${redirectTo}`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                },
            });
            if (authError) throw authError;
        } catch (err: any) {
            setError(err.message || 'Error initiating Google login');
            setLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}${redirectTo}`,
                    // Apple requires some specific scopes for better profile data
                    scopes: 'email name'
                },
            });
            if (authError) throw authError;
        } catch (err: any) {
            setError(err.message || 'Error initiating Apple login');
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[420px] flex flex-col items-center"
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 text-center mt-12">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back</h1>
                        <p className="text-slate-500 font-medium max-w-[300px]">
                            Log in to access your account.
                        </p>
                    </div>

                    {/* Card */}
                    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8">
                        {/* Social Auth */}
                        <div className="flex flex-col gap-3 mb-6">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-700 text-sm"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Sign in with Google
                            </button>

                            <button
                                onClick={handleAppleLogin}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#000000] hover:bg-[#1a1a1a] transition-all font-semibold text-white text-sm"
                            >
                                <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                </svg>
                                Sign in with Apple
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
                            </div>
                        </div>

                        {/* Email / Password form */}
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-1.5">
                                    <Link to="/forgot-password" data-weights="bold" className="text-xs font-bold text-[#0ea5e9] hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
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
                                Sign in
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-[#0ea5e9] font-bold hover:underline">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </motion.div>
        </div>
    );
};
