import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export const FadeInUp = ({ children, delay = 0, className = "" }: FadeInProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

export const FadeInDown = ({ children, delay = 0, className = "" }: FadeInProps) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);
