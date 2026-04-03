import React from 'react';
import { User, Moon, Settings, LogOut } from 'lucide-react';

interface AccountPopoverProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AccountPopover = ({ isOpen, onClose }: AccountPopoverProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

            {/* Popover Menu - Positioned 'pop up' style from bottom left */}
            <div className="absolute left-64 bottom-20 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="w-72 bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/10">
                            <span className="text-white font-bold text-lg">K</span>
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm">Kortez</div>
                            <div className="text-zinc-500 text-xs">kevjohnson032@gmail.com</div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 flex flex-col">
                        <MenuItem icon={User} label="Profile" />
                        <MenuItem icon={Moon} label="Enable Light Mode" />
                        <MenuItem icon={Settings} label="Settings" />
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-white/10">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium">
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const MenuItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm text-left">
        <Icon className="w-4 h-4" />
        {label}
    </button>
);
