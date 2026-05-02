import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
    onOpenDownload: () => void;
    onOpenAuth: (view: 'login' | 'signup') => void;
}

export const PublicLayout = ({ children, onOpenDownload, onOpenAuth }: PublicLayoutProps) => {
    return (
        <div className="relative min-h-screen font-sans text-slate-900 bg-white flex flex-col">
            <Navbar onOpenModal={onOpenDownload} onOpenAuth={onOpenAuth} />

            {/* Global Background Mesh (Persistent) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
                <div className="absolute inset-0 bg-[#ffffff]" />
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/5 blur-[120px]" />
                <div className="absolute top-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-slate-500/5 blur-[120px]" />
            </div>

            <main className="flex-1 flex flex-col">
                {children}
            </main>

            <Footer onOpenModal={onOpenDownload} />
        </div>
    );
};
