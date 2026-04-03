import React, { useState } from 'react';
import { User, Moon, Sun, Settings, LogOut, ChevronRight, Bell, Shield, Key } from 'lucide-react';
import { Button } from '../ui/Button';

export const AccountSettings = () => {
    const [isLightMode, setIsLightMode] = useState(false);

    return (
        <div className="max-w-3xl mx-auto p-8 text-white space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black mb-2">My Account</h1>
                <p className="text-zinc-500">Manage your profile and preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-sky-500/20">
                    JD
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold text-white">John Doe</h2>
                    <p className="text-zinc-500 text-sm">john.doe@example.com</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        Free Plan
                    </div>
                </div>
                <Button variant="secondary" size="sm" className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                    Edit Profile
                </Button>
            </div>

            {/* Appearance */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold text-white">Appearance</h3>
                </div>
                <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setIsLightMode(!isLightMode)}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isLightMode ? 'bg-orange-500/10 text-orange-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            {isLightMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-bold text-white">Light Mode</p>
                            <p className="text-xs text-zinc-500">Enable light theme for the application</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isLightMode ? 'bg-sky-500' : 'bg-zinc-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isLightMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </div>
            </div>

            {/* General Settings */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold text-white">Settings</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {[
                        { icon: Bell, label: 'Notifications', desc: 'Manage alerts and emails' },
                        { icon: Shield, label: 'Privacy & Security', desc: '2FA and connected accounts' },
                        { icon: Key, label: 'Password', desc: 'Change your account password' },
                        { icon: Settings, label: 'Preferences', desc: 'Language and regional settings' },
                    ].map((item, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{item.label}</p>
                                    <p className="text-xs text-zinc-500">{item.desc}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Logout */}
            <button className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center gap-2 text-red-500 font-bold transition-all hover:scale-[1.02]">
                <LogOut className="w-5 h-5" />
                Sign Out
            </button>
        </div>
    );
};
