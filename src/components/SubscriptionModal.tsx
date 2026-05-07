import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Shield, Zap, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export type CheckoutPlanId = 'plus' | 'pro';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId?: CheckoutPlanId;
}

const PLANS: Record<CheckoutPlanId, {
    name: string;
    price: string;
    period: string;
    tagline: string;
    description: string;
    features: string[];
    color: string;
    icon: React.ReactNode;
}> = {
    plus: {
        name: 'Plus',
        price: '$99',
        period: '/year',
        tagline: 'Everything you need to study smarter.',
        description: 'Viszmo Plus gives you full access to the web and mobile study ecosystem — unlimited AI-powered flashcards, lecture notes, and study guides synced across all your devices.',
        features: [
            'Unlimited AI Chat & Responses',
            'Unlimited Lecture Notetaking',
            'Mobile & Web Study Ecosystem',
            'AI Flashcard & Quiz Generation',
            'Personalized Study Guides',
            'Standard Priority Support',
        ],
        color: 'from-sky-500 to-blue-600',
        icon: <Zap className="w-6 h-6 text-white" />,
    },
    pro: {
        name: 'Pro',
        price: '$171',
        period: '/year',
        tagline: 'Everything, unlimited, no compromises.',
        description: 'Viszmo Pro is the full power of Viszmo. Built for serious students who need the live Desktop Sidekick, stealth screen-share protection, and every premium feature — all in one plan.',
        features: [
            'Full Desktop Sidekick (Windows)',
            'Stealth Screen-Share Protection',
            'Unlimited AI Chat & Responses',
            'Unlimited Lecture Notetaking',
            'Mobile & Web Study Ecosystem',
            'AI Flashcard & Quiz Generation',
            'Personalized Study Guides',
            'VIP Priority Support',
        ],
        color: 'from-violet-500 to-purple-700',
        icon: <Star className="w-6 h-6 text-white" />,
    },
};

export const SubscriptionModal = ({ isOpen, onClose, planId }: SubscriptionModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setError(null);
            setLoading(false);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const plan = planId ? PLANS[planId] : null;

    const handleCheckout = async () => {
        if (!planId) return;
        setError(null);
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/login?redirect=/pricing';
                return;
            }

            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
            const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                    planId,
                    successUrl: `${window.location.origin}/dashboard?checkout=success`,
                    cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
            window.location.href = data.url;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
                    />

                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Gradient Header */}
                            {plan && (
                                <div className={`bg-gradient-to-r ${plan.color} p-8 relative overflow-hidden`}>
                                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                                    <div className="absolute -bottom-12 -left-4 w-32 h-32 bg-white/10 rounded-full" />
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                            {plan.icon}
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-5xl font-black text-white">{plan.price}</span>
                                            <span className="text-white/70 font-medium">{plan.period}</span>
                                        </div>
                                        <p className="text-white/80 text-sm font-medium">{plan.tagline}</p>
                                    </div>
                                </div>
                            )}

                            {/* Body */}
                            <div className="p-8">
                                {plan ? (
                                    <>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                            {plan.description}
                                        </p>

                                        <div className="space-y-3 mb-8">
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm text-slate-700 font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {error && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                                                ⚠️ {error}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-3">
                                            <div className="btn-wrapper w-full">
                                                <button
                                                    onClick={handleCheckout}
                                                    disabled={loading}
                                                    className="btn btn-black w-full justify-center disabled:opacity-70 disabled:cursor-wait"
                                                >
                                                    {loading ? (
                                                        <span className="btn-text flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Redirecting to Checkout...
                                                        </span>
                                                    ) : (
                                                        <span className="btn-text">Continue to Checkout →</span>
                                                    )}
                                                </button>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors text-center"
                                            >
                                                Maybe later
                                            </button>
                                        </div>

                                        <div className="mt-5 flex items-center justify-center gap-2 text-slate-400 text-xs">
                                            <Shield className="w-3.5 h-3.5" />
                                            <span>Secure checkout powered by Stripe. Cancel anytime.</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-slate-500">No plan selected.</p>
                                        <button onClick={onClose} className="mt-4 text-sm font-medium text-slate-700 hover:text-slate-900">Close</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
