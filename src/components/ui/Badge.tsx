import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: 'blue' | 'emerald' | 'rose' | 'amber' | 'slate' | 'indigo';
    variant?: 'default' | 'outline' | 'pill' | 'glass';
    className?: string;
    size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    color = 'blue',
    variant = 'default',
    className = '',
    size = 'sm'
}) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        slate: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    };

    const variantClasses = {
        default: 'border',
        outline: 'bg-transparent border',
        pill: 'rounded-full border',
        glass: 'backdrop-blur-md border'
    };

    const sizeClasses = {
        xs: 'px-2 py-0.5 text-[9px]',
        sm: 'px-3 py-1 text-[10px]',
        md: 'px-4 py-1.5 text-xs'
    };

    return (
        <span className={`inline-flex items-center font-black uppercase tracking-widest rounded-lg ${colorClasses[color]} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
};

export const StatusBadge: React.FC<{ status: 'active' | 'inactive' | 'pending' }> = ({ status }) => {
    const configs = {
        active: { color: 'emerald', label: 'Active' },
        inactive: { color: 'slate', label: 'Inactive' },
        pending: { color: 'amber', label: 'Pending' }
    } as const;

    const config = configs[status];

    return (
        <Badge color={config.color} variant="pill" size="xs">
            {config.label}
        </Badge>
    );
};
