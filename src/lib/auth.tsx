import { useState, useEffect, type ReactNode, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    userId: string | null;
    userEmail: string | null;
    userName: string | null;
    userImageUrl: string | null;
    userIdentities: any[] | null;
    signOut: () => Promise<void>;
    getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ?? null;
    };

    const value = {
        session,
        user,
        isLoading,
        isSignedIn: !!session,
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        userName: user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null,
        userImageUrl: user?.user_metadata?.avatar_url ?? null,
        userIdentities: user?.identities ?? null,
        signOut,
        getToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function SignedIn({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoading } = useAuth();
    if (isLoading) return null;
    return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoading } = useAuth();
    if (isLoading) return null;
    return !isSignedIn ? <>{children}</> : null;
}

export function RedirectToSignIn({ afterSignInUrl = '/dashboard' }: { afterSignInUrl?: string }) {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(`/login?redirect=${encodeURIComponent(afterSignInUrl)}`, { replace: true });
    }, [afterSignInUrl, navigate]);
    return null;
}

export function UserButton({ afterSignOutUrl = '/' }: { afterSignOutUrl?: string; appearance?: any }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate(afterSignOutUrl);
    };

    const avatarUrl = user?.user_metadata?.avatar_url;
    const initials = (user?.user_metadata?.full_name ?? user?.email ?? '?')
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm hover:scale-105 transition-transform overflow-hidden bg-[#0ea5e9] flex items-center justify-center text-white text-xs font-bold"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-white">{initials}</span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                            className="absolute right-0 top-11 z-50 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
                        >
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                <p className="text-xs font-bold text-slate-900 truncate">{user?.user_metadata?.full_name || 'User'}</p>
                                <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <div
                                    className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-400 cursor-not-allowed flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Dashboard (Soon)
                                </div>
                                <button
                                    onClick={() => { setOpen(false); navigate('/account'); }}
                                    className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Account
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export async function syncSupabaseAuth(_getToken?: any) {
    // No-op for Supabase native auth
}
