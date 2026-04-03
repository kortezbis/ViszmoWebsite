import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'dark' | 'glass';
    padding?: string;
    className?: string;
}

export const Card = ({
    children,
    variant = 'default',
    padding = 'p-6',
    className = ''
}: CardProps) => {
    const baseStyles = "rounded-[2rem] transition-all border overflow-hidden relative";

    const variants = {
        default: "bg-white border-slate-200 shadow-sm",
        dark: "bg-[#0a0a0a] border-white/5",
        glass: "bg-white/5 backdrop-blur-xl border-white/10"
    };

    const variantStyles = variants[variant] || variants.default;

    return (
        <div className={`${baseStyles} ${variantStyles} ${padding} ${className}`}>
            {children}
        </div>
    );
};
