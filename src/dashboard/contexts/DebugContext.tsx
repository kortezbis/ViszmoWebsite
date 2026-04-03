import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DebugContextType {
    debugEmpty: boolean;
    toggleDebugEmpty: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
    const [debugEmpty, setDebugEmpty] = useState(false);

    const toggleDebugEmpty = () => setDebugEmpty(prev => !prev);

    return (
        <DebugContext.Provider value={{ debugEmpty, toggleDebugEmpty }}>
            {children}
        </DebugContext.Provider>
    );
}

export function useDebug() {
    const context = useContext(DebugContext);
    if (context === undefined) {
        throw new Error('useDebug must be used within a DebugProvider');
    }
    return context;
}
