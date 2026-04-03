import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ================================
// Types
// ================================

export interface Card {
    id: number;
    front: string;
    back: string;
    image?: string;
    starred?: boolean;
    createdAt: string;
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    cards: Card[];
    folderId?: number | null;
    color: string;
    createdAt: string;
    updatedAt: string;
    lastStudied?: string;
    isDeleted?: boolean;
    deletedAt?: string;
}

export interface Folder {
    id: number;
    name: string;
    color: string;
    createdAt: string;
}

interface DecksContextType {
    // Data
    decks: Deck[];
    folders: Folder[];
    activeDeckId: string | null;
    activeDeck: Deck | null;

    // Deck CRUD
    createDeck: (title: string, description?: string, cards?: Omit<Card, 'id' | 'createdAt'>[]) => string;
    updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => void;
    deleteDeck: (id: string) => void;
    restoreDeck: (id: string) => void;
    permanentlyDeleteDeck: (id: string) => void;
    duplicateDeck: (id: string) => string | null;
    setActiveDeck: (id: string | null) => void;

    // Card operations on active deck
    addCard: (card: Omit<Card, 'id' | 'createdAt'>) => void;
    updateCard: (cardId: number, updates: Partial<Card>) => void;
    deleteCard: (cardId: number) => void;
    setCards: (cards: Card[]) => void;
    updateDeckTitle: (title: string) => void;

    // Folder CRUD
    createFolder: (name: string, color: string) => number;
    updateFolder: (id: number, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => void;
    deleteFolder: (id: number) => void;
    moveDeckToFolder: (deckId: string, folderId: number | null) => void;

    // Utility
    getDecksInFolder: (folderId: number | null) => Deck[];
    getActiveDecks: () => Deck[];
    getDeletedDecks: () => Deck[];
    getDeckById: (id: string) => Deck | undefined;

    // Import/Export
    importDeck: (deckData: Partial<Deck>) => string;
    exportDeck: (id: string) => string | null;
}

// ================================
// Storage Keys
// ================================

const DECKS_STORAGE_KEY = 'Viszmo_decks';
const FOLDERS_STORAGE_KEY = 'Viszmo_folders';
const ACTIVE_DECK_KEY = 'Viszmo_active_deck';

// ================================
// Default Data
// ================================

const defaultCards: Omit<Card, 'createdAt'>[] = [
    { id: 1, front: "What is the powerhouse of the cell?", back: "Mitochondria" },
    { id: 2, front: "What is the process by which plants make food?", back: "Photosynthesis" },
    { id: 3, front: "Which organ is primarily responsible for filtering blood?", back: "Kidneys" },
    { id: 4, front: "What molecule carries genetic information?", back: "DNA (Deoxyribonucleic Acid)" },
    { id: 5, front: "What is the basic unit of life?", back: "The Cell" },
    { id: 6, front: "What is the largest organ in the human body?", back: "Skin", starred: true },
    { id: 7, front: "Explain the function of the ribosome.", back: "Ribosomes are responsible for protein synthesis by translating messenger RNA (mRNA) into amino acid chains." },
    { id: 8, front: "What is the difference between mitosis and meiosis?", back: "Mitosis results in two genetically identical daughter cells, while meiosis results in four genetically diverse gametes.", starred: true },
    { id: 9, front: "Define 'Homeostasis'.", back: "The tendency of the body to maintain a stable internal environment despite external changes." },
    { id: 10, front: "What are the four main types of tissues in animals?", back: "Epithelial, Connective, Muscle, and Nervous tissue." }
];

const generateId = () => `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultDeck = (): Deck => ({
    id: generateId(),
    title: "Biology 101 - Test Deck",
    description: "Sample flashcard deck to get you started",
    cards: defaultCards.map(c => ({ ...c, createdAt: new Date().toISOString() })),
    color: 'bg-brand-primary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStudied: new Date().toISOString()
});

// ================================
// Context
// ================================

const DecksContext = createContext<DecksContextType | undefined>(undefined);

export function DecksProvider({ children }: { children: ReactNode }) {
    // Load initial state from localStorage
    const [decks, setDecks] = useState<Deck[]>(() => {
        try {
            const saved = localStorage.getItem(DECKS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to load decks from localStorage:', e);
        }
        return [createDefaultDeck()];
    });

    const [folders, setFolders] = useState<Folder[]>(() => {
        try {
            const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load folders from localStorage:', e);
        }
        return [];
    });

    const [activeDeckId, setActiveDeckId] = useState<string | null>(() => {
        try {
            const saved = localStorage.getItem(ACTIVE_DECK_KEY);
            if (saved) {
                return saved;
            }
        } catch (e) {
            console.warn('Failed to load active deck from localStorage:', e);
        }
        return null;
    });

    // Auto-delete trash items after 3 days
    useEffect(() => {
        const cleanupTrash = () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            setDecks(prev => prev.filter(deck => {
                if (!deck.isDeleted || !deck.deletedAt) return true;
                return new Date(deck.deletedAt) > threeDaysAgo;
            }));
        };

        cleanupTrash();
        // Check once a day
        const interval = setInterval(cleanupTrash, 24 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
        } catch (e) {
            console.warn('Failed to save decks to localStorage:', e);
        }
    }, [decks]);

    useEffect(() => {
        try {
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
        } catch (e) {
            console.warn('Failed to save folders to localStorage:', e);
        }
    }, [folders]);

    useEffect(() => {
        try {
            if (activeDeckId) {
                localStorage.setItem(ACTIVE_DECK_KEY, activeDeckId);
            } else {
                localStorage.removeItem(ACTIVE_DECK_KEY);
            }
        } catch (e) {
            console.warn('Failed to save active deck to localStorage:', e);
        }
    }, [activeDeckId]);

    // Computed: active deck object
    const activeDeck = activeDeckId
        ? decks.find(d => d.id === activeDeckId && !d.isDeleted) || null
        : decks.find(d => !d.isDeleted) || null;

    // ================================
    // Deck Operations
    // ================================

    const createDeck = (title: string, description?: string, cards?: Omit<Card, 'id' | 'createdAt'>[]): string => {
        const newId = generateId();
        const now = new Date().toISOString();

        const newDeck: Deck = {
            id: newId,
            title: title || 'Untitled Deck',
            description,
            cards: cards?.map((c, i) => ({
                ...c,
                id: i + 1,
                createdAt: now
            })) || [],
            color: 'bg-brand-primary',
            createdAt: now,
            updatedAt: now,
        };

        setDecks(prev => [...prev, newDeck]);
        setActiveDeckId(newId);
        return newId;
    };

    const updateDeck = (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => {
        setDecks(prev => prev.map(deck =>
            deck.id === id
                ? { ...deck, ...updates, updatedAt: new Date().toISOString() }
                : deck
        ));
    };

    const deleteDeck = (id: string) => {
        setDecks(prev => prev.map(deck =>
            deck.id === id
                ? { ...deck, isDeleted: true, deletedAt: new Date().toISOString() }
                : deck
        ));
        if (activeDeckId === id) {
            const remaining = decks.filter(d => d.id !== id && !d.isDeleted);
            setActiveDeckId(remaining.length > 0 ? remaining[0].id : null);
        }
    };

    const restoreDeck = (id: string) => {
        setDecks(prev => prev.map(deck =>
            deck.id === id
                ? { ...deck, isDeleted: false, deletedAt: undefined }
                : deck
        ));
    };

    const permanentlyDeleteDeck = (id: string) => {
        setDecks(prev => prev.filter(deck => deck.id !== id));
    };

    const duplicateDeck = (id: string): string | null => {
        const original = decks.find(d => d.id === id);
        if (!original) return null;

        const newId = generateId();
        const now = new Date().toISOString();

        const duplicate: Deck = {
            ...original,
            id: newId,
            title: `${original.title} (Copy)`,
            createdAt: now,
            updatedAt: now,
            lastStudied: undefined,
            isDeleted: false,
            deletedAt: undefined,
        };

        setDecks(prev => [...prev, duplicate]);
        return newId;
    };

    const setActiveDeck = (id: string | null) => {
        setActiveDeckId(id);
    };

    // ================================
    // Card Operations (on active deck)
    // ================================

    const addCard = (card: Omit<Card, 'id' | 'createdAt'>) => {
        if (!activeDeck) return;

        setDecks(prev => prev.map(deck => {
            if (deck.id !== activeDeck.id) return deck;

            const newId = Math.max(0, ...deck.cards.map(c => c.id)) + 1;
            return {
                ...deck,
                cards: [...deck.cards, { ...card, id: newId, createdAt: new Date().toISOString() }],
                updatedAt: new Date().toISOString()
            };
        }));
    };

    const updateCard = (cardId: number, updates: Partial<Card>) => {
        if (!activeDeck) return;

        setDecks(prev => prev.map(deck => {
            if (deck.id !== activeDeck.id) return deck;
            return {
                ...deck,
                cards: deck.cards.map(c => c.id === cardId ? { ...c, ...updates } : c),
                updatedAt: new Date().toISOString()
            };
        }));
    };

    const deleteCard = (cardId: number) => {
        if (!activeDeck) return;

        setDecks(prev => prev.map(deck => {
            if (deck.id !== activeDeck.id) return deck;
            return {
                ...deck,
                cards: deck.cards.filter(c => c.id !== cardId),
                updatedAt: new Date().toISOString()
            };
        }));
    };

    const setCards = (cards: Card[]) => {
        if (!activeDeck) return;

        setDecks(prev => prev.map(deck => {
            if (deck.id !== activeDeck.id) return deck;
            return {
                ...deck,
                cards,
                updatedAt: new Date().toISOString()
            };
        }));
    };

    const updateDeckTitle = (title: string) => {
        if (!activeDeck) return;
        updateDeck(activeDeck.id, { title });
    };

    // ================================
    // Folder Operations
    // ================================

    const createFolder = (name: string, color: string): number => {
        const newId = Date.now();
        const newFolder: Folder = {
            id: newId,
            name,
            color,
            createdAt: new Date().toISOString()
        };
        setFolders(prev => [...prev, newFolder]);
        return newId;
    };

    const updateFolder = (id: number, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => {
        setFolders(prev => prev.map(f =>
            f.id === id ? { ...f, ...updates } : f
        ));
    };

    const deleteFolder = (id: number) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        // Remove folder reference from decks
        setDecks(prev => prev.map(deck =>
            deck.folderId === id ? { ...deck, folderId: null } : deck
        ));
    };

    const moveDeckToFolder = (deckId: string, folderId: number | null) => {
        updateDeck(deckId, { folderId });
    };

    // ================================
    // Utility Functions
    // ================================

    const getDecksInFolder = (folderId: number | null): Deck[] => {
        return decks.filter(d => d.folderId === folderId && !d.isDeleted);
    };

    const getActiveDecks = (): Deck[] => {
        return decks.filter(d => !d.isDeleted);
    };

    const getDeletedDecks = (): Deck[] => {
        return decks.filter(d => d.isDeleted);
    };

    const getDeckById = (id: string): Deck | undefined => {
        return decks.find(d => d.id === id);
    };

    // ================================
    // Import/Export
    // ================================

    const importDeck = (deckData: Partial<Deck>): string => {
        const newId = generateId();
        const now = new Date().toISOString();

        const importedDeck: Deck = {
            id: newId,
            title: deckData.title || 'Imported Deck',
            description: deckData.description,
            cards: (deckData.cards || []).map((c, i) => ({
                ...c,
                id: i + 1,
                createdAt: now
            })),
            color: deckData.color || 'bg-brand-primary',
            createdAt: now,
            updatedAt: now,
        };

        setDecks(prev => [...prev, importedDeck]);
        return newId;
    };

    const exportDeck = (id: string): string | null => {
        const deck = decks.find(d => d.id === id);
        if (!deck) return null;

        // Create a shareable version (without internal IDs)
        const exportData = {
            title: deck.title,
            description: deck.description,
            cards: deck.cards.map(c => ({
                front: c.front,
                back: c.back,
                image: c.image,
                starred: c.starred
            })),
            color: deck.color,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(exportData);
    };

    // ================================
    // Provider
    // ================================

    return (
        <DecksContext.Provider value={{
            decks,
            folders,
            activeDeckId,
            activeDeck,
            createDeck,
            updateDeck,
            deleteDeck,
            restoreDeck,
            permanentlyDeleteDeck,
            duplicateDeck,
            setActiveDeck,
            addCard,
            updateCard,
            deleteCard,
            setCards,
            updateDeckTitle,
            createFolder,
            updateFolder,
            deleteFolder,
            moveDeckToFolder,
            getDecksInFolder,
            getActiveDecks,
            getDeletedDecks,
            getDeckById,
            importDeck,
            exportDeck
        }}>
            {children}
        </DecksContext.Provider>
    );
}

export function useDecks() {
    const context = useContext(DecksContext);
    if (context === undefined) {
        throw new Error('useDecks must be used within a DecksProvider');
    }
    return context;
}
