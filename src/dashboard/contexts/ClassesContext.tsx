import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

export interface SyllabusItem {
    id: string;
    title: string;
    description?: string;
    type: 'topic' | 'exam' | 'assignment' | 'quiz' | 'project';
    dueDate?: string; // ISO date
    weekNumber?: number;
    completed: boolean;
    notes?: string;
}

export interface StudyClass {
    id: string;
    name: string;
    code?: string; // e.g., "CS 101"
    color: string; // For visual distinction
    instructor?: string;
    schedule?: string; // e.g., "MWF 10:00 AM"
    syllabus: SyllabusItem[];
    createdAt: string;
    linkedDeckIds: string[]; // Connect flashcard decks to this class
}

export interface ClassesContextType {
    classes: StudyClass[];
    addClass: (classData: Omit<StudyClass, 'id' | 'createdAt' | 'syllabus' | 'linkedDeckIds'>) => string;
    updateClass: (classId: string, updates: Partial<StudyClass>) => void;
    deleteClass: (classId: string) => void;

    // Syllabus management
    addSyllabusItem: (classId: string, item: Omit<SyllabusItem, 'id' | 'completed'>) => void;
    updateSyllabusItem: (classId: string, itemId: string, updates: Partial<SyllabusItem>) => void;
    deleteSyllabusItem: (classId: string, itemId: string) => void;
    toggleSyllabusItemComplete: (classId: string, itemId: string) => void;

    // Deck linking
    linkDeck: (classId: string, deckId: string) => void;
    unlinkDeck: (classId: string, deckId: string) => void;

    // Utility
    getClass: (classId: string) => StudyClass | undefined;
    getUpcomingItems: (days?: number) => { classId: string; className: string; color: string; item: SyllabusItem }[];
    getOverdueItems: () => { classId: string; className: string; color: string; item: SyllabusItem }[];
    getClassProgress: (classId: string) => { total: number; completed: number; percentage: number };

    // Limits
    canAddClass: boolean;
    maxClasses: number;
}

const MAX_CLASSES = 4;

const CLASS_COLORS = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
];

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function ClassesProvider({ children }: { children: ReactNode }) {
    const [classes, setClasses] = useState<StudyClass[]>(() => {
        try {
            const saved = localStorage.getItem('studylayer_classes');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('studylayer_classes', JSON.stringify(classes));
    }, [classes]);

    // Generate unique ID
    const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get next available color
    const getNextColor = () => {
        const usedColors = classes.map(c => c.color);
        return CLASS_COLORS.find(c => !usedColors.includes(c)) || CLASS_COLORS[0];
    };

    // ========== CLASS CRUD ==========

    const addClass = (classData: Omit<StudyClass, 'id' | 'createdAt' | 'syllabus' | 'linkedDeckIds'>): string => {
        if (classes.length >= MAX_CLASSES) {
            throw new Error(`Maximum of ${MAX_CLASSES} classes allowed`);
        }

        const newClass: StudyClass = {
            ...classData,
            id: generateId(),
            color: classData.color || getNextColor(),
            createdAt: new Date().toISOString(),
            syllabus: [],
            linkedDeckIds: [],
        };

        setClasses(prev => [...prev, newClass]);
        return newClass.id;
    };

    const updateClass = (classId: string, updates: Partial<StudyClass>) => {
        setClasses(prev => prev.map(c =>
            c.id === classId ? { ...c, ...updates } : c
        ));
    };

    const deleteClass = (classId: string) => {
        setClasses(prev => prev.filter(c => c.id !== classId));
    };

    // ========== SYLLABUS MANAGEMENT ==========

    const addSyllabusItem = (classId: string, item: Omit<SyllabusItem, 'id' | 'completed'>) => {
        const newItem: SyllabusItem = {
            ...item,
            id: generateId(),
            completed: false,
        };

        setClasses(prev => prev.map(c =>
            c.id === classId
                ? { ...c, syllabus: [...c.syllabus, newItem] }
                : c
        ));
    };

    const updateSyllabusItem = (classId: string, itemId: string, updates: Partial<SyllabusItem>) => {
        setClasses(prev => prev.map(c =>
            c.id === classId
                ? {
                    ...c,
                    syllabus: c.syllabus.map(item =>
                        item.id === itemId ? { ...item, ...updates } : item
                    )
                }
                : c
        ));
    };

    const deleteSyllabusItem = (classId: string, itemId: string) => {
        setClasses(prev => prev.map(c =>
            c.id === classId
                ? { ...c, syllabus: c.syllabus.filter(item => item.id !== itemId) }
                : c
        ));
    };

    const toggleSyllabusItemComplete = (classId: string, itemId: string) => {
        setClasses(prev => prev.map(c =>
            c.id === classId
                ? {
                    ...c,
                    syllabus: c.syllabus.map(item =>
                        item.id === itemId ? { ...item, completed: !item.completed } : item
                    )
                }
                : c
        ));
    };

    // ========== DECK LINKING ==========

    const linkDeck = (classId: string, deckId: string) => {
        setClasses(prev => prev.map(c =>
            c.id === classId && !c.linkedDeckIds.includes(deckId)
                ? { ...c, linkedDeckIds: [...c.linkedDeckIds, deckId] }
                : c
        ));
    };

    const unlinkDeck = (classId: string, deckId: string) => {
        setClasses(prev => prev.map(c =>
            c.id === classId
                ? { ...c, linkedDeckIds: c.linkedDeckIds.filter(id => id !== deckId) }
                : c
        ));
    };

    // ========== UTILITY ==========

    const getClass = (classId: string) => classes.find(c => c.id === classId);

    const getUpcomingItems = (days: number = 7) => {
        const now = new Date();
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() + days);

        const upcoming: { classId: string; className: string; color: string; item: SyllabusItem }[] = [];

        classes.forEach(c => {
            c.syllabus.forEach(item => {
                if (item.dueDate && !item.completed) {
                    const dueDate = new Date(item.dueDate);
                    if (dueDate >= now && dueDate <= cutoff) {
                        upcoming.push({
                            classId: c.id,
                            className: c.name,
                            color: c.color,
                            item,
                        });
                    }
                }
            });
        });

        // Sort by due date
        return upcoming.sort((a, b) =>
            new Date(a.item.dueDate!).getTime() - new Date(b.item.dueDate!).getTime()
        );
    };

    const getOverdueItems = () => {
        const now = new Date();
        const overdue: { classId: string; className: string; color: string; item: SyllabusItem }[] = [];

        classes.forEach(c => {
            c.syllabus.forEach(item => {
                if (item.dueDate && !item.completed) {
                    const dueDate = new Date(item.dueDate);
                    if (dueDate < now) {
                        overdue.push({
                            classId: c.id,
                            className: c.name,
                            color: c.color,
                            item,
                        });
                    }
                }
            });
        });

        return overdue.sort((a, b) =>
            new Date(a.item.dueDate!).getTime() - new Date(b.item.dueDate!).getTime()
        );
    };

    const getClassProgress = (classId: string) => {
        const classData = getClass(classId);
        if (!classData || classData.syllabus.length === 0) {
            return { total: 0, completed: 0, percentage: 0 };
        }

        const total = classData.syllabus.length;
        const completed = classData.syllabus.filter(item => item.completed).length;
        const percentage = Math.round((completed / total) * 100);

        return { total, completed, percentage };
    };

    // ========== CONTEXT VALUE ==========

    const value: ClassesContextType = {
        classes,
        addClass,
        updateClass,
        deleteClass,
        addSyllabusItem,
        updateSyllabusItem,
        deleteSyllabusItem,
        toggleSyllabusItemComplete,
        linkDeck,
        unlinkDeck,
        getClass,
        getUpcomingItems,
        getOverdueItems,
        getClassProgress,
        canAddClass: classes.length < MAX_CLASSES,
        maxClasses: MAX_CLASSES,
    };

    return (
        <ClassesContext.Provider value={value}>
            {children}
        </ClassesContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useClasses() {
    const context = useContext(ClassesContext);
    if (context === undefined) {
        throw new Error('useClasses must be used within a ClassesProvider');
    }
    return context;
}
