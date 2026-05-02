import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const SignupPage = () => {
    const navigate = useNavigate();
    const { isSignedIn, isLoading: authLoading } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Detect errors from OAuth redirects
    useEffect(() => {
        const errorCode = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (errorCode) {
            setError(`${errorCode}: ${errorDescription || 'Authentication failed'}`);
        }
    }, [searchParams]);

    // Redirect if already signed in
    useEffect(() => {
        if (isSignedIn && !authLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, [isSignedIn, authLoading, navigate]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

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
            // Auto sign-in if email confirmation is disabled, else show success
            const { data: session } = await supabase.auth.getSession();
            if (session.session) {
                navigate('/dashboard', { replace: true });
            } else {
                setSuccess(true);
                setLoading(false);
            }
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { 
                    redirectTo: `${window.location.origin}/dashboard` ,
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

    const handleAppleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: { 
                    redirectTo: `${window.location.origin}/dashboard`,
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[420px] flex flex-col items-center"
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 text-center mt-12">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create an account</h1>
                        <p className="text-slate-500 font-medium max-w-[300px]">
                            Join the smartest students using AI to ace their grades.
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">Check your email</h2>
                            <p className="text-slate-500 text-sm">
                                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
                            </p>
                            <Link to="/login" className="inline-block mt-6 text-[#0ea5e9] font-bold text-sm hover:underline">
                                Back to sign in
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8">
                            {/* Social Auth */}
                            <div className="flex flex-col gap-3 mb-6">
                                <button
                                    onClick={handleGoogleSignup}
                                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-700 text-sm"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                    Sign in with Google
                                </button>

                                <button
                                    onClick={handleAppleSignup}
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

                            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        required
                                        placeholder="Jane Smith"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all"
                                    />
                                </div>

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
                                            minLength={6}
                                            placeholder="min. 6 characters"
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
                                    Create account
                                </button>

                                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                                    By creating an account, you agree to our{' '}
                                    <Link to="/terms" className="underline hover:text-slate-600">Terms</Link> and{' '}
                                    <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                                </p>
                            </form>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#0ea5e9] font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
        </div>
    );
};
