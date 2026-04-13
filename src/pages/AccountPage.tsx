import { useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

// Design System Imports
import { SetPasswordModal } from '../components/SetPasswordModal';
import { Navbar } from '../components/Navbar';

import { useAuth } from '../lib/auth';

export const AccountPage = () => {
    const { userEmail, userName } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col">
            <Navbar />

            <main className="flex-1 relative pt-32 pb-24">
                {/* Background (Shared) */}
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

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                        {/* Account Information Section */}
                        <div className="p-8 md:p-12">
                            <h2 className="text-2xl font-black text-slate-900 mb-8">Account Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <label className="text-sm font-medium text-slate-500 mb-2 block">Email</label>
                                    <div className="text-base font-semibold text-slate-900">{userEmail || '—'}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500 mb-2 block">Name</label>
                                    <div className="text-base font-semibold text-slate-900">{userName || 'User'}</div>
                                </div>
                            </div>

                            {/* Password Status */}
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                <span className="font-medium">No Password Set (SSO)</span>
                            </div>

                            {/* Set Password Button */}
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-all"
                            >
                                <Lock className="w-4 h-4" />
                                Set Account Password
                            </button>
                            <p className="text-xs text-slate-500 mt-3 font-medium">
                                Add a password to your account so you can sign in without your social provider.
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200"></div>

                        {/* Connected Accounts Section */}
                        <div className="p-8 md:p-12">
                            <h2 className="text-xl font-black text-slate-900 mb-6">Connected Accounts</h2>

                            {/* Google Account */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">Google</div>
                                            <div className="text-xs text-slate-500 font-medium">{userEmail}</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Connected</span>
                                    </div>
                                </div>

                                {/* Apple Account */}
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#000000] flex items-center justify-center">
                                            <svg viewBox="0 0 384 512" className="w-4 h-4 fill-white">
                                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">Apple</div>
                                            <div className="text-xs text-slate-500 font-medium">Connect to sync across devices</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Not Connected</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200"></div>

                        {/* Billing History Section */}
                        <div className="p-8 md:p-12">
                            <h2 className="text-xl font-black text-slate-900 mb-6">Billing History</h2>

                            {/* Empty State */}
                            <div className="text-center py-12">
                                <div className="text-slate-400 text-sm font-medium">No billing history yet</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <SetPasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
            </main>
        </div>
    );
};
