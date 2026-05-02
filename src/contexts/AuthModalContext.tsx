import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthView = 'login' | 'signup';

interface AuthModalContextType {
    isOpen: boolean;
    view: AuthView;
    openAuthModal: (view?: AuthView) => void;
    closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<AuthView>('login');

    const openAuthModal = (newView: AuthView = 'login') => {
        setView(newView);
        setIsOpen(true);
    };

    const closeAuthModal = () => {
        setIsOpen(false);
    };

    return (
        <AuthModalContext.Provider value={{ isOpen, view, openAuthModal, closeAuthModal }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
}
