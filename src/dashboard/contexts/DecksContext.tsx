import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useAuth } from '../../lib/auth';
import { db, type FlashcardRow } from '../../services/database';

// ================================
// Types
// ================================

export interface Card {
    id: string;
    front: string;
    back: string;
    image?: string;
    backImage?: string;
    starred?: boolean;
    createdAt: string;
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    /** Server-backed card list; kept in sync with `cards` table. */
    cards: Card[];
    /** From Supabase aggregate when cards are not yet hydrated (should match cards.length after load). */
    cardCount?: number;
    /** When set, deck belongs to a workspace (nested UI comes later). */
    workspaceId?: string;
    folderId?: number | null;
    color: string;
    createdAt: string;
    updatedAt: string;
    lastStudied?: string;
    isDeleted?: boolean;
    deletedAt?: string;
}

export interface Workspace {
    id: string;
    name: string;
    color: string;
    parentId: string | null;
    createdAt: string;
}

function mapRowToCard(row: FlashcardRow): Card {
    return {
        id: row.id,
        front: row.front,
        back: row.back,
        image: row.frontImage,
        backImage: row.backImage,
        starred: row.isStarred,
        createdAt: new Date(row.createdAt).toISOString(),
    };
}

interface DecksContextType {
    decks: Deck[];
    workspaces: Workspace[];
    activeDeckId: string | null;
    activeDeck: Deck | null;
    decksLoading: boolean;
    decksError: string | null;
    refreshDecks: () => Promise<void>;

    createDeck: (
        title: string,
        description?: string,
        cards?: Omit<Card, 'id' | 'createdAt'>[],
        workspaceId?: string,
    ) => Promise<string>;
    updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => Promise<void>;
    deleteDeck: (id: string) => Promise<void>;
    restoreDeck: (id: string) => void;
    permanentlyDeleteDeck: (id: string) => Promise<void>;
    duplicateDeck: (id: string) => Promise<string | null>;
    setActiveDeck: (id: string | null) => void;

    addCard: (card: Omit<Card, 'id' | 'createdAt'>) => Promise<void>;
    updateCard: (cardId: string, updates: Partial<Card>) => void;
    deleteCard: (cardId: string) => Promise<void>;
    setCards: (cards: Card[]) => void;
    updateDeckTitle: (title: string) => Promise<void>;

    createWorkspace: (name: string, color: string, parentId?: string | null) => Promise<string>;
    updateWorkspace: (id: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt'>>) => Promise<void>;
    deleteWorkspace: (id: string) => Promise<void>;
    moveDeckToWorkspace: (deckId: string, workspaceId: string | null) => Promise<void>;

    getDecksInWorkspace: (workspaceId: string | null) => Deck[];
    getActiveDecks: () => Deck[];
    getDeletedDecks: () => Deck[];
    getDeckById: (id: string) => Deck | undefined;

    importDeck: (deckData: Partial<Deck>) => Promise<string>;
    exportDeck: (id: string) => string | null;
}

const FOLDERS_STORAGE_KEY = 'Viszmo_folders';
const ACTIVE_DECK_KEY = 'Viszmo_active_deck';

const defaultDeckColor = 'bg-brand-primary';

const DecksContext = createContext<DecksContextType | undefined>(undefined);

const CARD_SAVE_DEBOUNCE_MS = 500;

export function DecksProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoading: authLoading } = useAuth();

    const [decks, setDecks] = useState<Deck[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
    const [decksLoading, setDecksLoading] = useState(false);
    const [decksError, setDecksError] = useState<string | null>(null);

    const cardSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const persistActiveDeck = useCallback((id: string | null) => {
        try {
            if (id) localStorage.setItem(ACTIVE_DECK_KEY, id);
            else localStorage.removeItem(ACTIVE_DECK_KEY);
        } catch (e) {
            console.warn('Failed to persist active deck:', e);
        }
    }, []);

    const refreshDecks = useCallback(async () => {
        if (!isSignedIn) {
            setDecks([]);
            setWorkspaces([]);
            return;
        }
        setDecksLoading(true);
        setDecksError(null);
        try {
            const [deckRows, workspaceRows] = await Promise.all([
                db.getDecks(),
                db.getWorkspaces()
            ]);

            const nextDecks: Deck[] = deckRows.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description,
                cards: [], // Hydrated on-demand or by specific page loaders
                cardCount: r.cardCount,
                workspaceId: r.workspaceId,
                folderId: null,
                color: defaultDeckColor,
                createdAt: new Date(r.createdAt).toISOString(),
                updatedAt: new Date(r.updatedAt).toISOString(),
                isDeleted: false,
            }));

            const nextWorkspaces: Workspace[] = workspaceRows.map(r => ({
                id: r.id,
                name: r.name,
                color: r.color,
                parentId: r.parentId,
                createdAt: new Date(r.createdAt).toISOString()
            }));

            setDecks(nextDecks);
            setWorkspaces(nextWorkspaces);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to load decks';
            console.error('[Decks]', msg);
            setDecksError(msg);
        } finally {
            setDecksLoading(false);
        }
    }, [isSignedIn]);

    useEffect(() => {
        if (authLoading) return;
        if (isSignedIn) void refreshDecks();
        else {
            setDecks([]);
            setWorkspaces([]);
            setActiveDeckId(null);
        }
    }, [authLoading, isSignedIn, refreshDecks]);

    const activeDeck = activeDeckId
        ? decks.find((d) => d.id === activeDeckId && !d.isDeleted) || null
        : decks.find((d) => !d.isDeleted) || null;

    const patchDeck = useCallback((deckId: string, fn: (d: Deck) => Deck) => {
        setDecks((prev) => prev.map((d) => (d.id === deckId ? fn(d) : d)));
    }, []);

    const createDeck = async (
        title: string,
        description?: string,
        initialCards?: Omit<Card, 'id' | 'createdAt'>[],
        workspaceId?: string,
    ): Promise<string> => {
        const created = await db.createDeck(title || 'Untitled Deck', workspaceId);
        if (description) {
            await db.updateDeck(created.id, { description });
        }
        if (initialCards && initialCards.length > 0) {
            await db.addFlashcards(
                created.id,
                initialCards.map((c) => ({
                    front: c.front,
                    back: c.back,
                    frontImage: c.image,
                    backImage: c.backImage,
                })),
            );
        }
        await refreshDecks();
        setActiveDeckId(created.id);
        return created.id;
    };

    const updateDeck = async (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => {
        const serverPayload: {
            title?: string;
            description?: string;
            workspaceId?: string | null;
        } = {};
        if (updates.title !== undefined) serverPayload.title = updates.title;
        if (updates.description !== undefined) serverPayload.description = updates.description;
        if (updates.workspaceId !== undefined) serverPayload.workspaceId = updates.workspaceId ?? null;

        if (Object.keys(serverPayload).length > 0) {
            await db.updateDeck(id, serverPayload);
        }

        setDecks((prev) =>
            prev.map((deck) =>
                deck.id === id
                    ? {
                          ...deck,
                          ...updates,
                          updatedAt: new Date().toISOString(),
                      }
                    : deck,
            ),
        );
    };

    const deleteDeck = async (id: string) => {
        await db.deleteDeck(id);
        setDecks((prev) => {
            const next = prev.filter((deck) => deck.id !== id);
            queueMicrotask(() => {
                setActiveDeckId((aid) => {
                    if (aid !== id) return aid;
                    const pick = next.find((d) => !d.isDeleted) ?? next[0];
                    return pick ? pick.id : null;
                });
            });
            return next;
        });
    };

    const restoreDeck = (_id: string) => {
        // Soft-delete is not stored server-side; trash is local-only legacy. No-op.
    };

    const permanentlyDeleteDeck = (id: string) => deleteDeck(id);

    const duplicateDeck = async (id: string): Promise<string | null> => {
        const original = decks.find((d) => d.id === id);
        if (!original) return null;

        let cards = original.cards;
        if (cards.length === 0) {
            const rows = await db.getFlashcardsByDeckId(id);
            cards = rows.map(mapRowToCard);
        }

        const created = await db.createDeck(`${original.title} (Copy)`, original.workspaceId);
        if (cards.length > 0) {
            await db.addFlashcards(
                created.id,
                cards.map((c) => ({
                    front: c.front,
                    back: c.back,
                    frontImage: c.image,
                    backImage: c.backImage,
                })),
            );
        }
        await refreshDecks();
        return created.id;
    };

    const setActiveDeck = (id: string | null) => {
        setActiveDeckId(id);
    };

    const flushCardSave = (cardId: string) => {
        const t = cardSaveTimers.current[cardId];
        if (t) clearTimeout(t);
        delete cardSaveTimers.current[cardId];
    };

    const scheduleCardSave = (cardId: string, merged: Card) => {
        flushCardSave(cardId);
        cardSaveTimers.current[cardId] = setTimeout(() => {
            void db
                .updateFlashcard(cardId, {
                    front: merged.front,
                    back: merged.back,
                    frontImage: merged.image,
                    backImage: merged.backImage,
                    isStarred: merged.starred,
                })
                .catch((e) => console.error('[Decks] Failed to save card:', e));
            delete cardSaveTimers.current[cardId];
        }, CARD_SAVE_DEBOUNCE_MS);
    };

    const addCard = async (card: Omit<Card, 'id' | 'createdAt'>) => {
        if (!activeDeck) return;
        const row = await db.createCard({
            deckId: activeDeck.id,
            front: card.front,
            back: card.back,
            frontImage: card.image,
            backImage: card.backImage,
        });
        const newCard = mapRowToCard(row);
        patchDeck(activeDeck.id, (d) => ({
            ...d,
            cards: [...d.cards, newCard],
            cardCount: (d.cardCount ?? d.cards.length) + 1,
            updatedAt: new Date().toISOString(),
        }));
    };

    const updateCard = (cardId: string, updates: Partial<Card>) => {
        if (!activeDeck) return;

        const prevCard = activeDeck.cards.find((c) => c.id === cardId);
        if (!prevCard) return;
        const merged: Card = { ...prevCard, ...updates };

        patchDeck(activeDeck.id, (d) => ({
            ...d,
            cards: d.cards.map((c) => (c.id === cardId ? merged : c)),
            updatedAt: new Date().toISOString(),
        }));

        scheduleCardSave(cardId, merged);
    };

    const deleteCard = async (cardId: string) => {
        if (!activeDeck) return;
        flushCardSave(cardId);
        await db.deleteFlashcard(cardId);
        patchDeck(activeDeck.id, (d) => ({
            ...d,
            cards: d.cards.filter((c) => c.id !== cardId),
            cardCount: Math.max(0, (d.cardCount ?? d.cards.length) - 1),
            updatedAt: new Date().toISOString(),
        }));
    };

    const setCards = (cards: Card[]) => {
        if (!activeDeck) return;
        // Local reorder only; persisted order follows `created_at` on reload (position column TBD).
        patchDeck(activeDeck.id, (d) => ({
            ...d,
            cards,
            updatedAt: new Date().toISOString(),
        }));
    };

    const updateDeckTitle = async (title: string) => {
        if (!activeDeck) return;
        await updateDeck(activeDeck.id, { title });
    };

    const createWorkspace = async (name: string, color: string, parentId: string | null = null): Promise<string> => {
        const created = await db.createWorkspace(name, color, parentId);
        await refreshDecks();
        return created.id;
    };

    const updateWorkspace = async (id: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt'>>) => {
        await db.updateWorkspace(id, updates);
        await refreshDecks();
    };

    const deleteWorkspace = async (id: string) => {
        await db.deleteWorkspace(id);
        await refreshDecks();
    };

    const moveDeckToWorkspace = async (deckId: string, workspaceId: string | null) => {
        await db.updateDeck(deckId, { workspaceId });
        await refreshDecks();
    };

    const getDecksInWorkspace = (workspaceId: string | null): Deck[] => {
        return decks.filter((d) => d.workspaceId === (workspaceId ?? undefined) && !d.isDeleted);
    };

    const getActiveDecks = (): Deck[] => {
        return decks.filter((d) => !d.isDeleted);
    };

    const getDeletedDecks = (): Deck[] => {
        return [];
    };

    const getDeckById = (id: string): Deck | undefined => {
        return decks.find((d) => d.id === id);
    };

    const importDeck = async (deckData: Partial<Deck>): Promise<string> => {
        const created = await db.createDeck(deckData.title || 'Imported Deck');
        const cards = deckData.cards || [];
        if (cards.length > 0) {
            await db.addFlashcards(
                created.id,
                cards.map((c) => ({
                    front: c.front,
                    back: c.back,
                    frontImage: c.image,
                    backImage: c.backImage,
                })),
            );
        }
        await refreshDecks();
        return created.id;
    };

    const exportDeck = (id: string): string | null => {
        const deck = decks.find((d) => d.id === id);
        if (!deck) return null;

        const exportData = {
            title: deck.title,
            description: deck.description,
            cards: deck.cards.map((c) => ({
                front: c.front,
                back: c.back,
                image: c.image,
                starred: c.starred,
            })),
            color: deck.color,
            exportedAt: new Date().toISOString(),
        };

        return JSON.stringify(exportData);
    };

    return (
        <DecksContext.Provider
            value={{
                decks,
                workspaces,
                activeDeckId,
                activeDeck,
                decksLoading,
                decksError,
                refreshDecks,
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
                createWorkspace,
                updateWorkspace,
                deleteWorkspace,
                moveDeckToWorkspace,
                getDecksInWorkspace,
                getActiveDecks,
                getDeletedDecks,
                getDeckById,
                importDeck,
                exportDeck,
            }}
        >
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

/** UI helper: prefer hydrated `cards.length`, fall back to server aggregate. */
export function getDeckCardCount(deck: Pick<Deck, 'cards' | 'cardCount'>): number {
    if (deck.cards.length > 0) return deck.cards.length;
    return deck.cardCount ?? 0;
}
