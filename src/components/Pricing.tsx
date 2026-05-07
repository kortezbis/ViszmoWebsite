import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { SubscriptionModal, type CheckoutPlanId } from './SubscriptionModal';

export const Pricing = () => {
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<CheckoutPlanId | null>(null);

    const openCheckout = (planId: CheckoutPlanId) => setSelectedPlan(planId);

    const plans = [
        {
            id: 'plus' as CheckoutPlanId,
            name: 'Plus',
            price: 99,
            period: '/year',
            monthly: '$8.25/mo',
            tagline: 'Full study ecosystem, all your devices.',
            features: [
                'Unlimited AI Chat & Responses',
                'Unlimited Lecture Notetaking',
                'Mobile & Web Ecosystem',
                'AI Flashcard & Quiz Generation',
                'Personalized Study Guides',
                'Standard Support',
            ],
            notIncluded: [
                'Desktop Sidekick',
                'Stealth Screen-Share Protection',
            ],
            popular: false,
            accentColor: 'bg-[#0ea5e9]',
        },
        {
            id: 'pro' as CheckoutPlanId,
            name: 'Pro',
            price: 171,
            period: '/year',
            monthly: '$14.25/mo',
            tagline: 'Everything, unlimited, no compromises.',
            features: [
                'Full Desktop Sidekick (Windows)',
                'Stealth Screen-Share Protection',
                'Unlimited AI Chat & Responses',
                'Unlimited Lecture Notetaking',
                'Mobile & Web Ecosystem',
                'AI Flashcard & Quiz Generation',
                'Personalized Study Guides',
                'VIP Priority Support',
            ],
            notIncluded: [],
            popular: true,
            accentColor: 'bg-[#8b5cf6]',
        },
    ];

    const comparisonFeatures = [
        { name: 'Chat & Responses', plus: 'Unlimited', pro: 'Unlimited' },
        { name: 'Lecture Notetaking', plus: 'Unlimited', pro: 'Unlimited' },
        { name: 'Mobile & Web Ecosystem', plus: true, pro: true },
        { name: 'AI Flashcard Generation', plus: true, pro: true },
        { name: 'Desktop Sidekick', plus: false, pro: true },
        { name: 'Stealth Protection', plus: false, pro: true },
        { name: 'Deep Study Mode', plus: true, pro: true },
        { name: 'VIP Priority Support', plus: false, pro: true },
    ];

    return (
        <section id="pricing" className="pb-24 md:pb-32 px-4 relative z-10 overflow-hidden bg-transparent">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 flex items-center justify-center gap-1 flex-wrap text-center">
                        <span>Start</span>
                        <img
                            src="/teamlogos/pricinglogo.png"
                            alt="Viszmo"
                            className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain drop-shadow-lg"
                        />
                        <span>for <span className="text-[#0ea5e9]">free.</span></span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto px-2">
                        Whether you're cramming for exams or building long-term knowledge, it starts free.
                        Upgrade anytime for the full experience.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Billed annually — cancel anytime
                    </div>
                </motion.div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-[#8b5cf6] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="mb-4">
                                    <div className={`group inline-block ${plan.accentColor} -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105`}>
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                            {plan.name}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-5xl font-bold text-slate-900 tracking-tight">${plan.price}</span>
                                    <span className="text-slate-500 font-medium">{plan.period}</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium mb-3">That's just {plan.monthly} — billed as one payment</p>
                                <p className={`text-sm ${plan.id === 'pro' ? 'pro-shimmer font-bold' : 'text-slate-500 font-medium'}`}>
                                    {plan.tagline}
                                </p>
                            </div>

                            <div className="mb-6 btn-wrapper w-full">
                                <button
                                    onClick={() => openCheckout(plan.id)}
                                    className="btn btn-black w-full"
                                >
                                    <span className="btn-text">Subscribe to {plan.name}</span>
                                </button>
                            </div>

                            <div className="space-y-3 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-[#0ea5e9] shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 opacity-40">
                                        <X className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-400 font-medium leading-tight line-through">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="text-center max-w-3xl mx-auto mb-16 pt-28">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
                    >
                        Detailed <span className="text-[#0ea5e9]">Comparison.</span>
                    </motion.h2>
                    <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed px-2">
                        Everything you need to know about our study plans.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="hidden md:block">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-1/2 pb-8 text-left" />
                                    {plans.map((plan) => (
                                        <th key={plan.id} className="pb-8 px-4 text-left align-top w-1/4">
                                            <div className="flex flex-col items-start gap-3">
                                                <div className={`group inline-block ${plan.accentColor} -skew-x-12 px-4 py-1.5 shadow-md transform`}>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 whitespace-nowrap">{plan.name}</h3>
                                                </div>
                                                <span className="text-slate-500 text-sm font-medium">${plan.price}/yr</span>
                                                <div className="btn-wrapper w-full max-w-[160px]">
                                                    <button
                                                        onClick={() => openCheckout(plan.id)}
                                                        className="btn btn-black w-full h-10"
                                                    >
                                                        <span className="btn-text text-xs font-bold">Subscribe</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={1} className="py-6">
                                        <h4 className="text-xl font-bold text-slate-900">Features</h4>
                                    </td>
                                    <td colSpan={2} className="py-6" />
                                </tr>
                                {comparisonFeatures.map((feature, idx) => (
                                    <tr key={idx} className="border-t border-slate-100">
                                        <td className="py-4 text-slate-900 font-bold text-sm">{feature.name}</td>
                                        {(['plus', 'pro'] as const).map((planKey) => {
                                            const val = (feature as Record<string, unknown>)[planKey];
                                            return (
                                                <td key={planKey} className="py-4 px-4 text-slate-500 text-sm font-medium">
                                                    {typeof val === 'boolean' ? (
                                                        val
                                                            ? <Check className="w-5 h-5 text-[#0ea5e9]" />
                                                            : <X className="w-5 h-5 text-red-400 opacity-50" />
                                                    ) : (
                                                        <span>{val as string}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile comparison */}
                    <div className="md:hidden space-y-6">
                        {plans.map((plan) => (
                            <div key={plan.id} className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div className={`inline-block ${plan.accentColor} -skew-x-12 px-4 py-1.5 shadow-md`}>
                                        <h3 className="text-xs font-black text-white uppercase tracking-wider transform skew-x-12">{plan.name}</h3>
                                    </div>
                                    <span className="text-slate-500 text-sm font-medium">${plan.price}/yr</span>
                                </div>
                                <div className="space-y-4">
                                    {comparisonFeatures.map((f, i) => {
                                        const val = (f as Record<string, unknown>)[plan.id];
                                        return (
                                            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100/50 last:border-0">
                                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{f.name}</span>
                                                <div className="text-sm font-bold text-slate-700">
                                                    {typeof val === 'boolean' ? (
                                                        val ? <Check className="w-4 h-4 text-[#0ea5e9]" /> : <X className="w-4 h-4 text-red-400 opacity-50" />
                                                    ) : val as string}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button onClick={() => openCheckout(plan.id)} className="mt-6 w-full btn-wrapper">
                                    <span className="btn btn-black w-full"><span className="btn-text text-sm">Subscribe to {plan.name}</span></span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ReferralModal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} />

            <SubscriptionModal
                isOpen={selectedPlan !== null}
                onClose={() => setSelectedPlan(null)}
                planId={selectedPlan ?? undefined}
            />
        </section>
    );
};
