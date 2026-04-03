import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Check, X, ChevronDown } from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { SubscriptionModal } from './SubscriptionModal';

type BillingCycle = 'monthly' | 'annual';

const AnimatedPrice = ({ value }: { value: number }) => {
    const count = useMotionValue(value);
    const rounded = useTransform(count, (latest) => latest.toFixed(2));

    useEffect(() => {
        const controls = animate(count, value, { duration: 0.5, ease: "circOut" });
        return () => controls.stop();
    }, [value, count]);

    return <motion.span>{rounded}</motion.span>;
};

export const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const subscriptionPlans = [
        {
            id: 'weekly',
            name: 'Weekly',
            monthly: { price: 5.99, period: '/wk' },
            annual: { price: 5.99, period: '/wk', total: 5.99, label: '7-day access' },
            features: [
                'Best for exams',
                'Unlimited AI messages',
                'Unlimited meeting notes',
                'Priority support',
            ],
            cta: 'Subscribe',
            popular: false,
            type: 'subscription' as const
        },
        {
            id: 'plus',
            name: 'Plus',
            monthly: { price: 8.99, period: '/mo' },
            annual: { price: 6.74, period: '/mo', total: 80.88, label: 'Billed $80.88/year' },
            features: [
                'Best for beginners',
                '500 AI messages/day',
                '30 meeting notes/mo',
                'Standard support',
            ],
            cta: 'Subscribe',
            popular: false,
            type: 'subscription' as const
        },
        {
            id: 'pro',
            name: 'Pro',
            monthly: { price: 16.99, period: '/mo' },
            annual: { price: 12.74, period: '/mo', total: 152.88, label: 'Billed $152.88/year' },
            features: [
                'Best for semester',
                'Unlimited AI messages',
                'Unlimited meeting notes',
                'Recurring subscription',
                'Priority support',
            ],
            cta: 'Subscribe',
            popular: true,
            type: 'subscription' as const
        }
    ];

    const comparisonPlans = [
        { id: 'weekly', name: 'Weekly', cta: 'Subscribe', hasDropdown: false },
        { id: 'plus', name: 'Plus', cta: 'Subscribe', hasDropdown: false },
        { id: 'pro', name: 'Pro', cta: 'Subscribe', hasDropdown: false }
    ];

    type FeatureMap = {
        name: string;
        weekly: string | boolean;
        plus: string | boolean;
        pro: string | boolean;
    };

    const comparisonFeatures: FeatureMap[] = [
        { name: 'AI messages per day', weekly: 'Unlimited', plus: '500', pro: 'Unlimited' },
        { name: 'Meeting notetaking', weekly: 'Unlimited', plus: '30/mo', pro: 'Unlimited' },
        { name: 'Subscription', weekly: '7-day Access', plus: 'Standard Access', pro: 'Unlimited Access' },
        { name: 'Custom Keybinds', weekly: true, plus: true, pro: true },
        { name: 'Advanced Screen Privacy', weekly: true, plus: true, pro: true }
    ];

    return (
        <section id="pricing" className="pb-24 md:pb-32 px-4 relative z-10 overflow-hidden bg-transparent">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-6"
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
                        Whether you're using Viszmo for homework, deep learning, or just curious, it's free to use.
                    </p>
                </motion.div>

                <div className="flex justify-center mb-8 -mt-2">
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                            className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors focus:outline-none"
                        >
                            <motion.div
                                className="absolute top-1 left-1 w-4 h-4 bg-slate-900 rounded-full shadow-sm"
                                animate={{ x: billingCycle === 'annual' ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={`text-sm font-semibold ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-400'}`}>Annually <span className="text-[#0ea5e9] text-xs ml-1">(Save 25%)</span></span>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
                        {subscriptionPlans
                            .filter(plan => plan.type === 'subscription')
                            .map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 right-0 bg-[#0ea5e9] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                                            POPULAR
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <div className="mb-4">
                                            <div className={`group inline-block ${plan.id === 'pro' ? 'bg-[#8b5cf6]' : 'bg-[#0ea5e9]'} shadow-violet-500/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105`}>
                                                <h3 className="text-lg font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                                    {plan.id === 'weekly' ? 'Weekly' : plan.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-5xl font-bold text-slate-900 tracking-tight">
                                                $<AnimatedPrice value={(plan as any)[billingCycle].price} />
                                            </span>
                                            <span className="text-slate-500 font-medium">
                                                {(plan as any)[billingCycle].period}
                                            </span>
                                        </div>
                                        {billingCycle === 'annual' && (plan as any).annual.label && (
                                            <p className="text-xs text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-1 rounded-md">
                                                {(plan as any).annual.label} <span className="opacity-60 mx-1">•</span> Save 25%
                                            </p>
                                        )}
                                        <p className={`mt-4 text-sm ${plan.id === 'pro' ? 'pro-shimmer font-bold' : 'text-slate-500 font-medium'}`}>
                                            {plan.id === 'pro' ? 'Everything, unlimited, no compromises.' : 'All essential features.'}
                                        </p>
                                    </div>

                                    <div className="mb-6 btn-wrapper w-full">
                                        <button
                                            onClick={() => setIsSubscriptionModalOpen(true)}
                                            className="btn btn-black w-full btn-all-nighter"
                                        >
                                            <span className="btn-text">{plan.cta}</span>
                                        </button>
                                    </div>

                                    <div className="space-y-4 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-[#0ea5e9] shrink-0" />
                                                <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                    </div>

                    <div className="text-center max-w-3xl mx-auto mb-16 pt-32">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
                        >
                            Detailed <span className="text-[#0ea5e9]">Comparison.</span>
                        </motion.h2>
                        <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed px-2">
                            Everything you need to know about our study plans.
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse table-fixed">
                                <thead>
                                    <tr>
                                        <th className="w-1/5 pb-8"></th>
                                        {comparisonPlans
                                            .map((plan) => {
                                                const fullPlan = subscriptionPlans.find(p => p.id === plan.id);
                                                const highlightColor = plan.id === 'pro' ? 'bg-[#8b5cf6] shadow-violet-500/20' : 'bg-[#0ea5e9] shadow-sky-500/20';

                                                return (
                                                    <th key={plan.id} className="pb-8 px-4 text-left align-top">
                                                        <div className="flex flex-col h-full items-start">
                                                            <div className="mb-3">
                                                                <div className={`group inline-block ${highlightColor} -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105`}>
                                                                    <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                                                        {plan.name}
                                                                    </h3>
                                                                </div>
                                                            </div>
                                                            <div className="mb-6">
                                                                {fullPlan && (
                                                                    <span className="text-slate-500 text-sm font-medium">
                                                                        $<AnimatedPrice value={(fullPlan as any)[billingCycle].price} />{' '}
                                                                        {(fullPlan as any)[billingCycle].period}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="btn-wrapper w-full max-w-[180px]">
                                                                <button
                                                                    onClick={() => setIsSubscriptionModalOpen(true)}
                                                                    className="btn btn-black w-full flex items-center justify-center gap-2 h-11 transition-all duration-300 btn-all-nighter shadow-violet-500/10 hover:shadow-violet-500/20"
                                                                >
                                                                    <span className="btn-text text-[13px] font-bold tracking-wide">{plan.cta}</span>
                                                                    {plan.hasDropdown && <ChevronDown className="w-4 h-4 opacity-70" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={1} className="py-8">
                                            <h4 className="text-xl font-bold text-slate-900">Features</h4>
                                        </td>
                                        <td colSpan={3} className="py-8"></td>
                                    </tr>
                                    {comparisonFeatures.map((feature, idx) => (
                                        <tr key={idx} className="border-t border-slate-100 transition-colors">
                                            <td className="py-5 text-slate-900 font-bold text-base">
                                                {feature.name}
                                            </td>
                                            {comparisonPlans
                                                .map((plan) => {
                                                    const val = (feature as any)[plan.id];


                                                    return (
                                                        <td key={plan.id} className="py-5 px-4 text-slate-500 text-base font-medium">
                                                            {val === 'Limited Access' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <X className="w-5 h-5 text-red-500" />
                                                                    <span>Limited Access</span>
                                                                </div>
                                                            ) : val === 'Unlimited Access' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Check className="w-5 h-5 text-[#0ea5e9]" />
                                                                    <span>Unlimited Access</span>
                                                                </div>
                                                            ) : typeof val === 'boolean' ? (
                                                                val ? <Check className="w-5 h-5 text-[#0ea5e9]" /> : <X className="w-5 h-5 text-slate-300" />
                                                            ) : (
                                                                val
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-6">
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Features</h4>
                            {comparisonPlans
                                .map((plan) => {
                                    const fullPlan = subscriptionPlans.find(p => p.id === plan.id);
                                    const highlightColor = plan.id === 'pro' ? 'bg-[#8b5cf6]' : 'bg-[#0ea5e9]';

                                    return (
                                        <div key={plan.id} className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className={`group inline-block ${highlightColor} -skew-x-12 px-4 py-1.5 shadow-md transform`}>
                                                    <h3 className="text-xs font-black text-white uppercase tracking-wider transform skew-x-12 whitespace-nowrap">
                                                        {plan.name}
                                                    </h3>
                                                </div>
                                                {fullPlan && (
                                                    <span className="text-slate-500 text-sm font-medium">
                                                        $<AnimatedPrice value={(fullPlan as any)[billingCycle].price} />{' '}
                                                        {(fullPlan as any)[billingCycle].period}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                {comparisonFeatures.map((f, i) => {
                                                    const val = (f as any)[plan.id];


                                                    return (
                                                        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100/50 last:border-0">
                                                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{f.name}</span>
                                                            <div className="text-sm font-bold text-slate-700">
                                                                {val === 'Limited Access' ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <X className="w-4 h-4 text-red-500" />
                                                                        <span>Limited Access</span>
                                                                    </div>
                                                                ) : val === 'Unlimited Access' ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <Check className="w-4 h-4 text-[#0ea5e9]" />
                                                                        <span>Unlimited Access</span>
                                                                    </div>
                                                                ) : typeof val === 'boolean' ? (
                                                                    val ? <Check className="w-4 h-4 text-[#0ea5e9]" /> : <X className="w-4 h-4 text-slate-300" />
                                                                ) : (
                                                                    val
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
            <ReferralModal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} />
            <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
        </section>
    );
};
