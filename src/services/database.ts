import { supabase } from '../lib/supabase';
import { getAuthenticatedUser, waitForSupabaseSession } from '../lib/supabaseSession';

/** Matches mobile `types/database` LectureNote shape used for transcripts table. */
export interface LectureNote {
    id: string;
    userId: string;
    workspaceId?: string;
    flashcardDeckId?: string;
    title: string;
    content: string;
    summary?: string;
    keyTakeaways?: string[];
    glossary?: { term: string; definition: string }[];
    date: string;
    duration?: string;
    createdAt: number;
    updatedAt: number;
}

export interface DeckRow {
    id: string;
    userId: string;
    workspaceId?: string;
    title: string;
    description?: string;
    cardCount: number;
    createdAt: number;
    updatedAt: number;
}

export interface FlashcardRow {
    id: string;
    deckId: string;
    front: string;
    back: string;
    frontImage?: string;
    backImage?: string;
    isStarred?: boolean;
    createdAt: number;
}

/** Matches `workspaces` table — used for nested “sub-deck” folders (see iOS `workspace-details`). */
export interface WorkspaceRow {
    id: string;
    profileId: string;
    name: string;
    color: string;
    iconName: string | null;
    parentId: string | null;
    createdAt: number;
}

function formatLectureDateLong(ts: number): string {
    try {
        return new Date(ts).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return new Date(ts).toISOString();
    }
}

class DatabaseService {
    async ensureSessionReady(timeout = 3500) {
        try {
            await waitForSupabaseSession(timeout);
            await getAuthenticatedUser();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error('[DB] Auth check failed:', msg);
            throw e;
        }
    }

    /** All decks for the user (flat). Nested workspace/subfolder UI can filter by `workspace_id` later. */
    async getDecks(): Promise<DeckRow[]> {
        await this.ensureSessionReady();
        const user = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('decks')
            .select('*, cards(count)')
            .eq('profile_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('[DB] Error fetching decks:', error);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            userId: row.profile_id as string,
            workspaceId: (row.workspace_id as string | null) ?? undefined,
            title: row.title as string,
            description: (row.description as string | undefined) ?? undefined,
            cardCount: (row.cards as { count: number }[] | undefined)?.[0]?.count ?? 0,
            createdAt: new Date(row.created_at as string).getTime(),
            updatedAt: new Date(row.updated_at as string).getTime(),
        }));
    }

    async getDeckById(id: string): Promise<DeckRow | undefined> {
        await this.ensureSessionReady();
        const { data, error } = await supabase.from('decks').select('*').eq('id', id).single();

        if (error || !data) return undefined;

        return {
            id: data.id,
            userId: data.profile_id,
            workspaceId: data.workspace_id ?? undefined,
            title: data.title,
            description: data.description ?? undefined,
            cardCount: 0,
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.updated_at).getTime(),
        };
    }

    async createDeck(title: string, workspaceId?: string): Promise<DeckRow> {
        await this.ensureSessionReady();
        const user = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('decks')
            .insert({
                profile_id: user.id,
                title,
                workspace_id: workspaceId ?? null,
            })
            .select()
            .single();

        if (error) {
            console.error('[DB] createDeck:', error.message);
            throw error;
        }

        return {
            id: data.id,
            userId: data.profile_id,
            workspaceId: data.workspace_id ?? undefined,
            title: data.title,
            description: data.description ?? undefined,
            cardCount: 0,
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.updated_at).getTime(),
        };
    }

    async updateDeck(
        deckId: string,
        updates: { title?: string; description?: string; workspaceId?: string | null },
    ): Promise<void> {
        await this.ensureSessionReady();
        const payload: Record<string, unknown> = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.workspaceId !== undefined) payload.workspace_id = updates.workspaceId;

        const { error } = await supabase.from('decks').update(payload).eq('id', deckId);

        if (error) {
            console.error('[DB] updateDeck:', error.message);
            throw error;
        }
    }

    async deleteDeck(deckId: string): Promise<void> {
        await this.ensureSessionReady();
        const { error: cardsErr } = await supabase.from('cards').delete().eq('deck_id', deckId);
        if (cardsErr) {
            console.error('[DB] deleteDeck cards:', cardsErr.message);
            throw cardsErr;
        }
        const { error: deckErr } = await supabase.from('decks').delete().eq('id', deckId);
        if (deckErr) {
            console.error('[DB] deleteDeck:', deckErr.message);
            throw deckErr;
        }
    }

    async getFlashcardsByDeckId(deckId: string): Promise<FlashcardRow[]> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('deck_id', deckId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[DB] getFlashcardsByDeckId:', error.message);
            return [];
        }

        return (data || []).map((row) => ({
            id: row.id,
            deckId: row.deck_id,
            front: row.front,
            back: row.back,
            frontImage: row.image ?? undefined,
            backImage: row.back_image ?? undefined,
            isStarred: row.is_starred ?? false,
            createdAt: new Date(row.created_at).getTime(),
        }));
    }

    /** Cards for many decks in one round-trip (same as mobile `cards` + `deck_id` filter). */
    async getFlashcardsByDeckIds(deckIds: string[]): Promise<Record<string, FlashcardRow[]>> {
        if (deckIds.length === 0) return {};
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .in('deck_id', deckIds)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[DB] getFlashcardsByDeckIds:', error.message);
            return {};
        }

        const map: Record<string, FlashcardRow[]> = {};
        for (const id of deckIds) map[id] = [];
        for (const row of data || []) {
            const deckId = row.deck_id as string;
            if (!map[deckId]) map[deckId] = [];
            map[deckId].push({
                id: row.id,
                deckId,
                front: row.front,
                back: row.back,
                frontImage: row.image ?? undefined,
                backImage: row.back_image ?? undefined,
                isStarred: row.is_starred ?? false,
                createdAt: new Date(row.created_at).getTime(),
            });
        }
        return map;
    }

    async addFlashcards(
        deckId: string,
        cards: { front: string; back: string; frontImage?: string; backImage?: string }[],
    ): Promise<void> {
        if (cards.length === 0) return;
        await this.ensureSessionReady();
        const insertData = cards.map((c) => ({
            deck_id: deckId,
            front: c.front,
            back: c.back,
            image: c.frontImage,
            back_image: c.backImage,
        }));

        const { error } = await supabase.from('cards').insert(insertData);

        if (error) {
            console.error('[DB] addFlashcards:', error.message);
            throw error;
        }
    }

    async updateFlashcard(
        cardId: string,
        updates: Partial<{
            front: string;
            back: string;
            frontImage: string | undefined;
            backImage: string | undefined;
            isStarred: boolean;
        }>,
    ): Promise<void> {
        await this.ensureSessionReady();
        const updateData: Record<string, unknown> = {};
        if (updates.front !== undefined) updateData.front = updates.front;
        if (updates.back !== undefined) updateData.back = updates.back;
        if (updates.frontImage !== undefined) updateData.image = updates.frontImage;
        if (updates.backImage !== undefined) updateData.back_image = updates.backImage;
        if (updates.isStarred !== undefined) updateData.is_starred = updates.isStarred;

        if (Object.keys(updateData).length === 0) return;

        const { error } = await supabase.from('cards').update(updateData).eq('id', cardId);

        if (error) {
            console.error('[DB] updateFlashcard:', error.message);
            throw error;
        }
    }

    async deleteFlashcard(cardId: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase.from('cards').delete().eq('id', cardId);
        if (error) {
            console.error('[DB] deleteFlashcard:', error.message);
            throw error;
        }
    }

    async createCard(params: {
        deckId: string;
        front?: string;
        back?: string;
        frontImage?: string;
        backImage?: string;
    }): Promise<FlashcardRow> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('cards')
            .insert({
                deck_id: params.deckId,
                front: params.front ?? '',
                back: params.back ?? '',
                image: params.frontImage,
                back_image: params.backImage,
            })
            .select()
            .single();

        if (error) {
            console.error('[DB] createCard:', error.message);
            throw error;
        }

        return {
            id: data.id,
            deckId: data.deck_id,
            front: data.front,
            back: data.back,
            frontImage: data.image ?? undefined,
            backImage: data.back_image ?? undefined,
            isStarred: data.is_starred ?? false,
            createdAt: new Date(data.created_at).getTime(),
        };
    }

    async getLectureNotes(): Promise<LectureNote[]> {
        await this.ensureSessionReady();
        const user = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('transcripts')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] Error fetching transcripts:', error);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => {
            const meta = row.metadata as { workspaceId?: string; flashcardDeckId?: string } | null;
            const created = new Date(row.created_at as string).getTime();
            return {
                id: row.id as string,
                userId: row.profile_id as string,
                workspaceId: meta?.workspaceId,
                flashcardDeckId: meta?.flashcardDeckId,
                title: (row.title as string) || 'Untitled Lecture',
                content: (row.content as string) || '',
                summary: row.summary as string | undefined,
                keyTakeaways: (row.key_takeaways as string[]) || [],
                glossary: (row.glossary as { term: string; definition: string }[]) || [],
                date: formatLectureDateLong(created),
                duration: (row.duration as string) || '0:00',
                createdAt: created,
                updatedAt: created,
            };
        });
    }

    async getWorkspaceById(id: string): Promise<WorkspaceRow | undefined> {
        await this.ensureSessionReady();
        const { data, error } = await supabase.from('workspaces').select('*').eq('id', id).single();

        if (error || !data) return undefined;

        return {
            id: data.id,
            profileId: data.profile_id,
            name: data.name,
            color: data.color || '#3B82F6',
            iconName: data.icon_name ?? null,
            parentId: data.parent_id ?? null,
            createdAt: new Date(data.created_at).getTime(),
        };
    }

    /** Child workspaces (sub-folders / “sub-decks”) under a parent workspace. */
    async getSubWorkspaces(parentId: string): Promise<WorkspaceRow[]> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('parent_id', parentId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] getSubWorkspaces:', error.message);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            profileId: row.profile_id as string,
            name: row.name as string,
            color: (row.color as string) || '#3B82F6',
            iconName: (row.icon_name as string | null) ?? null,
            parentId: (row.parent_id as string | null) ?? null,
            createdAt: new Date(row.created_at as string).getTime(),
        }));
    }

    async getDecksByWorkspace(wsId: string): Promise<DeckRow[]> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('decks')
            .select('*, cards(count)')
            .eq('workspace_id', wsId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('[DB] getDecksByWorkspace:', error.message);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            userId: row.profile_id as string,
            workspaceId: (row.workspace_id as string | null) ?? undefined,
            title: row.title as string,
            description: (row.description as string | undefined) ?? undefined,
            cardCount: (row.cards as { count: number }[] | undefined)?.[0]?.count ?? 0,
            createdAt: new Date(row.created_at as string).getTime(),
            updatedAt: new Date(row.updated_at as string).getTime(),
        }));
    }

    /** Approximate card count for a workspace (direct decks + optional nested sub-workspace decks). Mirrors iOS `getWorkspaceStats` intent. */
    async getWorkspaceCardCount(wsId: string): Promise<number> {
        await this.ensureSessionReady();
        const { data: directDecks } = await supabase.from('decks').select('id').eq('workspace_id', wsId);
        let deckIds = (directDecks || []).map((d: { id: string }) => d.id);

        const { data: subWs } = await supabase.from('workspaces').select('id').eq('parent_id', wsId);
        if (subWs && subWs.length > 0) {
            const subIds = subWs.map((w: { id: string }) => w.id);
            const { data: subDecks } = await supabase.from('decks').select('id').in('workspace_id', subIds);
            deckIds = [...deckIds, ...(subDecks || []).map((d: { id: string }) => d.id)];
        }

        if (deckIds.length === 0) return 0;

        const { count, error } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .in('deck_id', deckIds);

        if (error) return 0;
        return count ?? 0;
    }

    async getLectureNoteById(id: string): Promise<LectureNote | undefined> {
        await this.ensureSessionReady();
        const { data, error } = await supabase.from('transcripts').select('*').eq('id', id).single();

        if (error || !data) return undefined;

        const meta = data.metadata as { workspaceId?: string; flashcardDeckId?: string } | null;
        const created = new Date(data.created_at).getTime();

        return {
            id: data.id,
            userId: data.profile_id,
            workspaceId: meta?.workspaceId,
            flashcardDeckId: meta?.flashcardDeckId,
            title: data.title || 'Untitled Lecture',
            content: data.content || '',
            summary: data.summary,
            keyTakeaways: data.key_takeaways || [],
            glossary: data.glossary || [],
            date: formatLectureDateLong(created),
            duration: data.duration || '0:00',
            createdAt: created,
            updatedAt: created,
        };
    }
}

export const db = new DatabaseService();
