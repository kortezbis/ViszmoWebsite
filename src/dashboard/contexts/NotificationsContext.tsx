import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'streak' | 'deck' | 'podcast' | 'system';
    read: boolean;
    createdAt: number;
}

interface NotificationsContextValue {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
    markAllRead: () => void;
    markRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const STORAGE_KEY = 'viszmo_notifications';

function loadFromStorage(): AppNotification[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AppNotification[]) : [];
    } catch {
        return [];
    }
}

function saveToStorage(ns: AppNotification[]) {
    try {
        // Keep last 50
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ns.slice(0, 50)));
    } catch {/* ignore */}
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>(loadFromStorage);

    useEffect(() => {
        saveToStorage(notifications);
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
        const newNotif: AppNotification = {
            ...n,
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            createdAt: Date.now(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const markRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
    return ctx;
}
