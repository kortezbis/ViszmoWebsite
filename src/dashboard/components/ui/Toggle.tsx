import { motion } from 'framer-motion';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export const Toggle = ({ checked, onChange, className = '' }: ToggleProps) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none ${checked ? 'bg-[#0ea5e9]' : 'bg-slate-200 dark:bg-white/10'} ${className}`}
    >
        <motion.div
            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ x: checked ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    </button>
);
