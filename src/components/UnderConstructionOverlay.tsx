import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Construction, Smartphone, Laptop, Lock } from 'lucide-react';

/**
 * UnderConstructionOverlay
 * 
 * A premium, glassmorphism overlay to cover the dashboard while it's in development.
 * Allows dev access via a hidden trigger in the bottom right.
 */
export const UnderConstructionOverlay: React.FC = () => {
    const [showDevLogin, setShowDevLogin] = useState(false);
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('viszmo_dev_access');
        if (auth === 'true') {
            setIsAuthorized(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple password for dev access: viszmo_dev_2026
        if (password === 'viszmo_dev_2026') {
            localStorage.setItem('viszmo_dev_access', 'true');
            setIsAuthorized(true);
            window.location.reload();
        } else {
            alert('Incorrect developer access key.');
        }
    };

    if (isAuthorized) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Semi-transparent Backdrop - allows seeing the dashboard underneath */}
            <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-md transition-all duration-700" />
            
            {/* Subtle Gradient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 max-w-2xl w-full bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_32px_128px_rgba(0,0,0,0.1)] rounded-[3rem] p-8 md:p-14 text-center overflow-hidden"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                    <Construction size={200} className="rotate-12" />
                </div>

                {/* Top Icon Area */}
                <div className="mb-10 relative inline-block">
                    <div className="absolute inset-0 bg-[#0ea5e9]/20 blur-2xl rounded-full" />
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] text-white shadow-xl shadow-[#0ea5e9]/20">
                        <Construction size={48} strokeWidth={1.5} />
                    </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Dashboard Under <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]">Construction</span>
                </h2>

                <div className="space-y-6 text-slate-600 text-lg leading-relaxed mb-12">
                    <p className="font-medium">
                        We're currently perfecting the <span className="text-slate-900">Viszmo On-Screen Study Assistant</span> and finalizing our core website dashboard functionality.
                    </p>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-6 border-y border-slate-100">
                        <div className="flex items-center gap-3 px-4 py-2 bg-sky-50 rounded-2xl text-[#0ea5e9] border border-sky-100/50">
                            <Smartphone size={20} />
                            <span className="text-sm font-bold uppercase tracking-wider">Mobile First</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                            <Laptop size={20} />
                            <span className="text-sm font-bold uppercase tracking-wider">Web Compatibility Soon</span>
                        </div>
                    </div>

                    <p className="text-base text-slate-500">
                        We're focusing on our mobile experience first to deliver the most powerful AI study tools to you faster. Full website compatibility is our next priority!
                    </p>
                </div>

                {/* Main Action */}
                <div className="flex flex-col items-center gap-6">
                    <div className="btn-wrapper">
                        <button className="btn">
                            <span className="btn-text">Notify Me When Web Launches</span>
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        PREMIUM EXPERIENCE • COMING 2026
                    </p>
                </div>

                {/* Hidden Developer Access Trigger */}
                <div className="absolute bottom-8 right-10">
                    {!showDevLogin ? (
                        <button 
                            onClick={() => setShowDevLogin(true)}
                            className="w-3 h-3 rounded-full bg-slate-200/50 hover:bg-blue-300/50 transition-colors cursor-pointer"
                            title="Developer Access"
                        />
                    ) : (
                        <motion.form 
                            initial={{ opacity: 0, scale: 0.9, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            onSubmit={handleLogin}
                            className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-xl"
                        >
                            <input 
                                type="password" 
                                placeholder="Access Key" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-28 px-2 font-medium"
                                autoFocus
                            />
                            <button type="submit" className="p-2 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-colors">
                                <Lock size={14} />
                            </button>
                            <button type="button" onClick={() => setShowDevLogin(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <span className="text-lg leading-none">×</span>
                            </button>
                        </motion.form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
