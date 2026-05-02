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

export interface StudyGuide {
    id: string;
    userId: string;
    workspaceId?: string;
    title: string;
    topic: string | null;
    content: string;
    createdAt: number;
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
    /** Populated by getWorkspaces() — mirrors iOS getWorkspaceStats */
    stats?: { cardCount: number; mastery: number; subdeckCount: number };
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
            .eq('is_deleted', false)
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
        const { data, error } = await supabase
            .from('decks')
            .select('*')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();

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
            .eq('is_deleted', false)
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

    async getFlashcardsByWorkspace(wsId: string): Promise<FlashcardRow[]> {
        await this.ensureSessionReady();
        // 1. Get all decks in this workspace
        const { data: decks } = await supabase
            .from('decks')
            .select('id')
            .eq('workspace_id', wsId)
            .eq('is_deleted', false);
        
        if (!decks || decks.length === 0) return [];
        const deckIds = decks.map(d => d.id);

        // 2. Get all cards for those decks
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .in('deck_id', deckIds)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[DB] getFlashcardsByWorkspace:', error.message);
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

    /** Approximate card count for a workspace (direct decks + optional nested sub-workspace decks). Mirrors iOS `getWorkspaceStats` intent. */
    async getWorkspaceCardCount(wsId: string): Promise<number> {
        await this.ensureSessionReady();
        const { data: directDecks } = await supabase
            .from('decks')
            .select('id')
            .eq('workspace_id', wsId)
            .eq('is_deleted', false);
        let deckIds = (directDecks || []).map((d: { id: string }) => d.id);

        const { data: subWs } = await supabase.from('workspaces').select('id').eq('parent_id', wsId);
        if (subWs && subWs.length > 0) {
            const subIds = subWs.map((w: { id: string }) => w.id);
            const { data: subDecks } = await supabase
                .from('decks')
                .select('id')
                .in('workspace_id', subIds)
                .eq('is_deleted', false);
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

    async getWorkspaces(): Promise<WorkspaceRow[]> {
        await this.ensureSessionReady();
        const user = await getAuthenticatedUser();
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] getWorkspaces:', error.message);
            return [];
        }

        const workspaces: WorkspaceRow[] = (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            profileId: row.profile_id as string,
            name: row.name as string,
            color: (row.color as string) || '#3B82F6',
            iconName: (row.icon_name as string | null) ?? null,
            parentId: (row.parent_id as string | null) ?? null,
            createdAt: new Date(row.created_at as string).getTime(),
        }));

        // Optimize stats fetching: instead of N queries, fetch all required data in bulk
        const [allDecksRes, allCardsRes] = await Promise.all([
            supabase.from('decks').select('id, workspace_id').eq('is_deleted', false),
            // Fetching just deck_id for cards is sufficient to count them locally
            supabase.from('cards').select('deck_id')
        ]);

        const allDecks = allDecksRes.data || [];
        const allCards = allCardsRes.data || [];

        // Build dictionaries for O(1) lookups
        const deckCardCounts: Record<string, number> = {};
        allCards.forEach((c: { deck_id: string }) => {
            deckCardCounts[c.deck_id] = (deckCardCounts[c.deck_id] || 0) + 1;
        });

        // Group decks by workspace
        const wsDeckIds: Record<string, string[]> = {};
        allDecks.forEach((d: { id: string, workspace_id: string }) => {
            if (!wsDeckIds[d.workspace_id]) wsDeckIds[d.workspace_id] = [];
            wsDeckIds[d.workspace_id].push(d.id);
        });

        // Compute subdeck maps
        const wsSubdeckCounts: Record<string, number> = {};
        const wsSubWsIds: Record<string, string[]> = {};
        workspaces.forEach(ws => {
            if (ws.parentId) {
                wsSubdeckCounts[ws.parentId] = (wsSubdeckCounts[ws.parentId] || 0) + 1;
                if (!wsSubWsIds[ws.parentId]) wsSubWsIds[ws.parentId] = [];
                wsSubWsIds[ws.parentId].push(ws.id);
            }
        });

        // Attach stats
        workspaces.forEach(ws => {
            const directDecks = wsDeckIds[ws.id] || [];
            let allDeckIds = [...directDecks];
            
            // Include decks from sub-workspaces
            const subWsIds = wsSubWsIds[ws.id] || [];
            subWsIds.forEach(subId => {
                if (wsDeckIds[subId]) {
                    allDeckIds = allDeckIds.concat(wsDeckIds[subId]);
                }
            });

            const cardCount = allDeckIds.reduce((sum, deckId) => sum + (deckCardCounts[deckId] || 0), 0);

            ws.stats = {
                cardCount,
                mastery: 0,
                subdeckCount: wsSubdeckCounts[ws.id] || 0
            };
        });

        return workspaces;
    }

    /** Mirrors iOS getWorkspaceStats — card count across direct + sub-workspace decks. */
    async getWorkspaceStats(wsId: string): Promise<{ cardCount: number; mastery: number; subdeckCount: number }> {
        const [decksResult, subdecksResult] = await Promise.all([
            supabase.from('decks').select('id').eq('workspace_id', wsId).eq('is_deleted', false),
            supabase.from('workspaces').select('id').eq('parent_id', wsId),
        ]);

        const directDecks = decksResult.data || [];
        const subWorkspaces = subdecksResult.data || [];
        const subdeckCount = subWorkspaces.length;

        let allDeckIds = directDecks.map((d: { id: string }) => d.id);

        if (subWorkspaces.length > 0) {
            const subWsIds = subWorkspaces.map((sw: { id: string }) => sw.id);
            const { data: subDecks } = await supabase
                .from('decks')
                .select('id')
                .in('workspace_id', subWsIds)
                .eq('is_deleted', false);
            if (subDecks) allDeckIds = [...allDeckIds, ...subDecks.map((d: { id: string }) => d.id)];
        }

        if (allDeckIds.length === 0) return { cardCount: 0, mastery: 0, subdeckCount };

        const { count } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .in('deck_id', allDeckIds);

        return { cardCount: count ?? 0, mastery: 0, subdeckCount };
    }

    /** Mirrors iOS getNotesByWorkspace — queries metadata JSON field directly, not "fetch all → filter". */
    async getNotesByWorkspace(wsId: string): Promise<LectureNote[]> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('transcripts')
            .select('*')
            .filter('metadata->>workspaceId', 'eq', wsId);

        if (error) {
            console.error('[DB] getNotesByWorkspace:', error.message);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => {
            const meta = row.metadata as { workspaceId?: string; flashcardDeckId?: string } | null;
            const created = new Date(row.created_at as string).getTime();
            return {
                id: row.id as string,
                userId: row.profile_id as string,
                workspaceId: wsId,
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

    /** Mirrors iOS getStudyGuidesByWorkspace — queries workspace_id column directly. */
    async getStudyGuidesByWorkspace(wsId: string): Promise<StudyGuide[]> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('study_guides')
            .select('*')
            .eq('workspace_id', wsId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] getStudyGuidesByWorkspace:', error.message);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            userId: row.profile_id as string,
            workspaceId: wsId,
            title: row.title as string,
            topic: row.topic as string | null,
            content: row.content as string,
            createdAt: new Date(row.created_at as string).getTime(),
        }));
    }

    async getStudyGuides(): Promise<StudyGuide[]> {
        await this.ensureSessionReady();
        const user = await getAuthenticatedUser();
        const { data, error } = await supabase
            .from('study_guides')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] getStudyGuides:', error.message);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            userId: row.profile_id as string,
            workspaceId: (row.workspace_id as string | null) ?? undefined,
            title: row.title as string,
            topic: row.topic as string | null,
            content: row.content as string,
            createdAt: new Date(row.created_at as string).getTime(),
        }));
    }

    async createWorkspace(name: string, color: string, iconName?: string, parentId?: string): Promise<WorkspaceRow> {
        await this.ensureSessionReady();
        const user = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('workspaces')
            .insert({
                profile_id: user.id,
                name: name.trim(),
                color: color || '#3B82F6',
                icon_name: iconName || 'folder',
                parent_id: parentId || null,
            })
            .select()
            .single();

        if (error || !data) {
            console.error('[DB] createWorkspace:', error?.message);
            throw error || new Error('Create failed');
        }

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

    async updateWorkspace(wsId: string, updates: { name?: string; color?: string }): Promise<void> {
        await this.ensureSessionReady();
        const payload: Record<string, unknown> = {};
        if (updates.name !== undefined) payload.name = updates.name.trim();
        if (updates.color !== undefined) payload.color = updates.color;

        const { error } = await supabase.from('workspaces').update(payload).eq('id', wsId);

        if (error) {
            console.error('[DB] updateWorkspace:', error.message);
            throw error;
        }
    }

    async deleteWorkspace(wsId: string): Promise<void> {
        await this.ensureSessionReady();
        // Cascading delete is usually handled by Supabase DB constraints (ON DELETE CASCADE),
        // but we'll call the delete on the workspace itself.
        const { error } = await supabase.from('workspaces').delete().eq('id', wsId);

        if (error) {
            console.error('[DB] deleteWorkspace:', error.message);
            throw error;
        }
    }
}

export const db = new DatabaseService();
