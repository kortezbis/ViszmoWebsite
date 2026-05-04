import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { StaticPageLayout } from '../components/StaticPageLayout';

export const DesktopAuthSuccessPage = () => {
    useEffect(() => {
        // Handle deep link redirect
        const handleDeepLink = () => {
            const hash = window.location.hash;
            const search = window.location.search;
            const deepLinkBase = 'viszmo://auth/callback';
            
            // Construct the full deep link with existing params/hash
            const fullDeepLink = `${deepLinkBase}${search}${hash}`;
            
            console.log('Attempting deep link to:', fullDeepLink);
            
            // Small delay to allow the success page to actually render first
            setTimeout(() => {
                window.location.href = fullDeepLink;
            }, 1500);
        };

        handleDeepLink();
    }, []);

    return (
        <StaticPageLayout
            title="Success!"
            subtitle="You've successfully signed in to Viszmo."
        >
            <div className="flex flex-col items-center text-center space-y-8 py-12">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="relative"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
                        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-4 bg-green-400/10 rounded-full -z-10"
                    />
                </motion.div>

                <div className="space-y-4 max-w-md mx-auto">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Return to the Desktop App</h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        We're redirecting you back to the app now. If nothing happens, click the button below to continue.
                    </p>
                </div>

                <div className="pt-8 flex flex-col items-center gap-6 w-full">
                    <button 
                        onClick={() => {
                            const hash = window.location.hash;
                            const search = window.location.search;
                            window.location.href = `viszmo://auth/callback${search}${hash}`;
                        }}
                        className="w-full max-w-xs bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200"
                    >
                        Open Viszmo
                    </button>
                    
                    <p className="text-sm text-slate-400 font-medium">
                        Once you're back in the app, <br className="sm:hidden" />
                        you can safely <span className="text-slate-600 font-bold">close this window</span>.
                    </p>
                </div>
            </div>
        </StaticPageLayout>
    );
};
