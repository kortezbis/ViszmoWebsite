import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Zap, Shield, Sparkles, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../lib/auth';
import { useAuthModal } from '../contexts/AuthModalContext';
import { supabase } from '../lib/supabase';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { resolvedTheme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const { isSignedIn, getToken } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Pricing Data
  const plans = {
    weekly: {
      id: 'price_weekly',
      name: 'Weekly',
      price: '$4.99',
      interval: 'week',
      description: 'Perfect for short-term study sessions.',
      features: ['Full Pro Access', 'Unlock Overlay', 'Unlimited AI Generations']
    },
    monthly: {
      id: 'price_monthly',
      name: 'Monthly',
      price: '$19.99',
      interval: 'month',
      description: 'Our most popular plan for consistent learners.',
      features: ['Full Pro Access', 'Unlock Overlay', 'Unlimited AI Generations', 'Priority Support']
    },
    yearly: {
      id: 'price_yearly',
      name: 'Yearly',
      price: '$119.99',
      interval: 'year',
      savings: 'Save 50%',
      description: 'The best value for long-term academic success.',
      features: ['Full Pro Access', 'Unlock Overlay', 'Unlimited AI Generations', 'Priority Support', 'Exclusive Beta Features']
    }
  };

  const currentPlans = billingCycle === 'monthly' ? [plans.weekly, plans.monthly] : [plans.yearly];

  const handleCheckout = async (planType: string) => {
    if (!isSignedIn) {
      openAuthModal('signup');
      return;
    }

    // Map internal selection to Edge Function plan IDs
    let planId = '';
    if (planType === 'weekly') {
      planId = 'weekly';
    } else if (planType === 'monthly') {
      planId = 'pro_monthly';
    } else if (planType === 'yearly') {
      planId = 'pro_yearly';
    } else {
      // Fallback if planType is already something like 'pro' or 'plus'
      planId = `${planType}_${billingCycle}`;
    }

    setIsRedirecting(planId);
    try {
      const token = await getToken();
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { 
          planId,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      
      // Try to extract the specific error message from the response body if possible
      let errorMessage = err.message || 'Unknown error';
      
      // If it's a FunctionsHttpError, the detail might be in the response
      if (err.context?.error) {
        errorMessage = err.context.error.message || JSON.stringify(err.context.error);
      }

      alert('Failed to start checkout: ' + errorMessage);
    } finally {
      setIsRedirecting(null);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl ${
              resolvedTheme === 'dark' ? 'bg-[#111112]' : 'bg-white'
            }`}
          >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="relative p-8 pb-0 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-brand-primary">Pro Access</span>
                </div>
                <h2 className="text-3xl font-black text-foreground">Level up your learning</h2>
                <p className="text-foreground-secondary mt-1 font-medium">Unlock the full power of Viszmo across all platforms.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-hover text-foreground-secondary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Billing Toggle */}
            <div className="relative px-8 pt-8 flex justify-center">
              <div className="bg-surface-hover p-1.5 rounded-[1.25rem] flex gap-1 border border-border">
                <button
                  onClick={() => {
                    setBillingCycle('monthly');
                    setSelectedPlan('monthly');
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-white/10 text-foreground shadow-lg'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Monthly & Weekly
                </button>
                <button
                  onClick={() => {
                    setBillingCycle('yearly');
                    setSelectedPlan('yearly');
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${
                    billingCycle === 'yearly'
                      ? 'bg-white dark:bg-white/10 text-foreground shadow-lg'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Yearly
                  {billingCycle !== 'yearly' && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg">
                      -50%
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="relative p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {currentPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  layout
                  onClick={() => setSelectedPlan(plan.name.toLowerCase() as any)}
                  className={`relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer group flex flex-col ${
                    selectedPlan === plan.name.toLowerCase()
                      ? 'border-brand-primary bg-brand-primary/[0.03] ring-4 ring-brand-primary/5'
                      : 'border-border bg-surface hover:border-border-active'
                  }`}
                >
                  {plan.interval === 'year' && (
                    <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-500 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/20">
                      Best Value
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-black text-foreground mb-1">{plan.name}</h3>
                    <p className="text-sm text-foreground-secondary font-medium leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">{plan.price}</span>
                      <span className="text-foreground-secondary font-bold">/{plan.interval}</span>
                    </div>
                    {plan.savings && (
                      <span className="text-xs font-bold text-emerald-500 mt-1 block">
                        Equivalent to {(119.99/12).toFixed(2)}/mo
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${
                          selectedPlan === plan.name.toLowerCase() ? 'bg-brand-primary/20 text-brand-primary' : 'bg-surface-active text-foreground-muted'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-semibold text-foreground-secondary group-hover:text-foreground transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckout(plan.name.toLowerCase());
                    }}
                    disabled={!!isRedirecting}

                    className={`w-full py-4 rounded-2xl text-sm font-black transition-all active:scale-[0.98] ${
                      selectedPlan === plan.name.toLowerCase()
                        ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/25 hover:shadow-2xl hover:shadow-brand-primary/40 hover:-translate-y-0.5'
                        : 'bg-surface-active text-foreground hover:bg-surface-active/80 border border-border'
                    }`}
                  >
                    {isRedirecting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      selectedPlan === plan.name.toLowerCase() ? 'Choose Pro Access' : `Select ${plan.name}`
                    )}
                  </button>
                </motion.div>
              ))}

              {/* Special Info Card for Yearly if only one plan */}
              {billingCycle === 'yearly' && (
                <div className="bg-surface/50 border border-dashed border-border rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-secondary/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-brand-secondary" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">Maximize your potential</h4>
                  <p className="text-sm text-foreground-secondary font-medium leading-relaxed max-w-[240px]">
                    Join thousands of students using Viszmo Pro to save time and study smarter.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 pt-0 border-t border-border bg-surface-hover/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-foreground-secondary">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-foreground-secondary">Instant Activation</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button className="text-[10px] font-bold text-foreground-muted hover:text-foreground transition-colors uppercase tracking-widest">Privacy Policy</button>
                  <button className="text-[10px] font-bold text-foreground-muted hover:text-foreground transition-colors uppercase tracking-widest">Terms of Service</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
