import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    useCssButton?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth,
    className = '',
    useCssButton,
    ...props
}: ButtonProps) => {
    if (useCssButton) {
        return (
            <div className={`btn-wrapper ${fullWidth ? 'w-full' : ''} ${className}`}>
                <button className="btn" {...props}>
                    {leftIcon && <span className="mr-2">{leftIcon}</span>}
                    <span className="btn-text">{children}</span>
                    {rightIcon && <span className="ml-2">{rightIcon}</span>}
                </button>
            </div>
        );
    }

    const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 shadow-lg shadow-[#0ea5e9]/20",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
        danger: "bg-red-500 text-white hover:bg-red-600",
        ghost: "bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white",
        outline: "bg-transparent border border-white/10 hover:border-white/20 text-white"
    };

    const sizes = {
        sm: "h-10 px-4 text-xs rounded-xl",
        md: "h-12 px-6 text-sm rounded-2xl",
        lg: "h-14 px-8 text-base rounded-2xl"
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = sizes[size] || sizes.md;
    const widthStyles = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
            {...props}
        >
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
};

export const LinkButton = (props: any) => <Button {...props} />;
