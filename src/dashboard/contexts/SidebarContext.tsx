import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
    hideSidebar: boolean;
    setHideSidebar: (hide: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [hideSidebar, setHideSidebar] = useState(false);
    return (
        <SidebarContext.Provider value={{ hideSidebar, setHideSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
