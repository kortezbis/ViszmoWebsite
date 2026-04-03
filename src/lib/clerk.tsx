import { ClerkProvider, useAuth as useClerkAuthOriginal, useUser as useClerkUserOriginal, useClerk, SignIn, SignUp, UserButton, SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut } from '@clerk/clerk-react';
import { type ReactNode } from 'react';
import { supabase } from './supabase';

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
    if (!CLERK_PUBLISHABLE_KEY) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Clerk API Key Missing</h1>
                    <p className="text-slate-500">Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local</p>
                </div>
            </div>
        );
    }

    return (
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            {children}
        </ClerkProvider>
    );
}

// Custom hooks that wrap Clerk's originals
export function useAuth() {
    return useClerkAuthOriginal();
}

export function useUser() {
    return useClerkUserOriginal();
}

export function SignedIn({ children }: { children: ReactNode }) {
    return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }: { children: ReactNode }) {
    return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

// Re-export other Clerk hooks and components
export { useClerk, SignIn, SignUp, UserButton };

// Helper hook for our specific app needs
export function useClerkSession() {
    const { isLoaded, isSignedIn, userId, signOut, getToken } = useAuth();
    const { user } = useUser();

    return {
        isLoading: !isLoaded,
        isSignedIn: isSignedIn ?? false,
        userId: userId ?? null,
        userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
        userName: user?.fullName ?? user?.firstName ?? null,
        userImageUrl: user?.imageUrl ?? null,
        signOut,
        getToken,
    };
}

// Function to sync Clerk with Supabase
export async function syncSupabaseAuth(getToken: any) {
    try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
            await supabase.auth.setSession({
                access_token: token,
                refresh_token: '', // Clerk handles refresh
            });
        }
    } catch (error) {
        console.error('Error syncing Supabase auth:', error);
    }
}
