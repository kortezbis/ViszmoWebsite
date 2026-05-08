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

export interface PodcastRow {
    id: string;
    userId: string;
    workspaceId?: string;
    title: string;
    script?: any;
    audioUrl?: string;
    voiceId?: string;
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
    private cachedUser: any = null;
    private lastAuthCheck = 0;

    async ensureSessionReady(timeout = 3500) {
        // Cache auth for 30 seconds to avoid constant remote calls
        if (this.cachedUser && Date.now() - this.lastAuthCheck < 30000) {
            return this.cachedUser;
        }

        try {
            this.cachedUser = await getAuthenticatedUser();
            this.lastAuthCheck = Date.now();
            return this.cachedUser;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error('[DB] Auth check failed:', msg);
            throw e;
        }
    }

    /** All decks for the user (flat). Nested workspace/subfolder UI can filter by `workspace_id` later. */
    async getDecks(): Promise<DeckRow[]> {
        const user = await this.ensureSessionReady();

        const { data, error } = await supabase
            .from('decks')
            .select('*, cards(count)')
            .eq('profile_id', user.id)
            .is('deleted_at', null)
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
            .is('deleted_at', null)
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
        const user = await this.ensureSessionReady();

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
        const { error } = await supabase
            .from('decks')
            .update({ 
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
            .eq('id', deckId);
            
        if (error) {
            console.error('[DB] soft deleteDeck:', error.message);
            throw error;
        }
    }

    async restoreDeck(deckId: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('decks')
            .update({ 
                is_deleted: false,
                deleted_at: null
            })
            .eq('id', deckId);
            
        if (error) {
            console.error('[DB] restoreDeck:', error.message);
            throw error;
        }
    }

    async permanentlyDeleteDeck(deckId: string): Promise<void> {
        await this.ensureSessionReady();
        // Delete cards first
        await supabase.from('cards').delete().eq('deck_id', deckId);
        const { error } = await supabase.from('decks').delete().eq('id', deckId);
        if (error) {
            console.error('[DB] permanentlyDeleteDeck:', error.message);
            throw error;
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
        const user = await this.ensureSessionReady();

        const { data, error } = await supabase
            .from('transcripts')
            .select('id, profile_id, title, summary, key_takeaways, glossary, duration, created_at, metadata')
            .eq('profile_id', user.id)
            .is('deleted_at', null)
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
                content: '', // Omitted for list performance
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
        const { data, error } = await supabase.from('workspaces').select('*').eq('id', id).is('deleted_at', null).single();

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
            .is('deleted_at', null)
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
            .is('deleted_at', null)
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
        
        // Use a join to get cards for all non-deleted decks in this workspace in one go
        const { data, error } = await supabase
            .from('cards')
            .select(`
                *,
                decks!inner(workspace_id, is_deleted, deleted_at)
            `)
            .eq('decks.workspace_id', wsId)
            .is('decks.deleted_at', null)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[DB] getFlashcardsByWorkspace:', error.message);
            return [];
        }

        return (data || []).map((row: any) => ({
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
            .is('deleted_at', null);
        let deckIds = (directDecks || []).map((d: { id: string }) => d.id);

        const { data: subWs } = await supabase.from('workspaces').select('id').eq('parent_id', wsId);
        if (subWs && subWs.length > 0) {
            const subIds = subWs.map((w: { id: string }) => w.id);
            const { data: subDecks } = await supabase
                .from('decks')
                .select('id')
                .in('workspace_id', subIds)
                .is('deleted_at', null);
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
        const { data, error } = await supabase.from('transcripts').select('*').eq('id', id).is('deleted_at', null).single();

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
        const user = await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('profile_id', user.id)
            .is('deleted_at', null)
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

        // Optimize stats fetching: fetch all decks with their card counts in one go
        const { data: allDecks, error: decksErr } = await supabase
            .from('decks')
            .select('id, workspace_id, cards(count)')
            .eq('profile_id', user.id)
            .is('deleted_at', null);

        if (decksErr) {
            console.error('[DB] stats fetch error:', decksErr.message);
        }

        // Build dictionaries for O(1) lookups
        const deckCardCounts: Record<string, number> = {};
        (allDecks || []).forEach((d: any) => {
            deckCardCounts[d.id] = d.cards?.[0]?.count || 0;
        });

        // Group decks by workspace
        const wsDeckIds: Record<string, string[]> = {};
        (allDecks || []).forEach((d: any) => {
            if (d.workspace_id) {
                if (!wsDeckIds[d.workspace_id]) wsDeckIds[d.workspace_id] = [];
                wsDeckIds[d.workspace_id].push(d.id);
            }
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
            supabase.from('decks').select('id').eq('workspace_id', wsId).is('deleted_at', null),
            supabase.from('workspaces').select('id').eq('parent_id', wsId).is('deleted_at', null),
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
                .is('deleted_at', null);
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
            .select('id, profile_id, title, duration, created_at, metadata')
            .filter('metadata->>workspaceId', 'eq', wsId)
            .is('deleted_at', null);

        if (error) {
            console.error('[DB] getNotesByWorkspace:', error.message);
            return [];
        }

        return (data || []).map((row: any) => {
            const meta = row.metadata as { workspaceId?: string; flashcardDeckId?: string } | null;
            const created = new Date(row.created_at as string).getTime();
            return {
                id: row.id,
                userId: row.profile_id,
                workspaceId: wsId,
                flashcardDeckId: meta?.flashcardDeckId,
                title: row.title || 'Untitled Lecture',
                content: '', // Omitted for workspace list performance
                summary: undefined,
                keyTakeaways: [],
                glossary: [],
                date: formatLectureDateLong(created),
                duration: row.duration || '0:00',
                createdAt: created,
                updatedAt: created,
            } as LectureNote;
        });
    }

    /** Mirrors iOS getStudyGuidesByWorkspace — queries workspace_id column directly. */
    async getStudyGuidesByWorkspace(wsId: string): Promise<StudyGuide[]> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('study_guides')
            .select('id, profile_id, title, topic, created_at')
            .eq('workspace_id', wsId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] getStudyGuidesByWorkspace:', error.message);
            return [];
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            userId: row.profile_id,
            workspaceId: wsId,
            title: row.title,
            topic: row.topic,
            content: '', // Omitted for workspace list performance
            createdAt: new Date(row.created_at as string).getTime(),
        } as StudyGuide));
    }

    async getStudyGuides(): Promise<StudyGuide[]> {
        const user = await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('study_guides')
            .select('id, profile_id, workspace_id, title, topic, created_at')
            .eq('profile_id', user.id)
            .is('deleted_at', null)
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
            content: '', // Omitted for list performance
            createdAt: new Date(row.created_at as string).getTime(),
        }));
    }

    async getStudyGuideById(id: string): Promise<StudyGuide | undefined> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('study_guides')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error || !data) {
            if (error) console.error('[DB] getStudyGuideById:', error.message);
            return undefined;
        }

        return {
            id: data.id,
            userId: data.profile_id,
            workspaceId: data.workspace_id ?? undefined,
            title: data.title,
            topic: data.topic,
            content: data.content,
            createdAt: new Date(data.created_at).getTime(),
        };
    }

    async createWorkspace(name: string, color: string, iconName?: string, parentId?: string): Promise<WorkspaceRow> {
        const user = await this.ensureSessionReady();

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
        const { error } = await supabase
            .from('workspaces')
            .update({ 
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
            .eq('id', wsId);

        if (error) {
            console.error('[DB] soft deleteWorkspace:', error.message);
            throw error;
        }
    }

    async restoreWorkspace(wsId: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('workspaces')
            .update({ 
                is_deleted: false,
                deleted_at: null
            })
            .eq('id', wsId);

        if (error) {
            console.error('[DB] restoreWorkspace:', error.message);
            throw error;
        }
    }

    async permanentlyDeleteWorkspace(wsId: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase.from('workspaces').delete().eq('id', wsId);
        if (error) {
            console.error('[DB] permanentlyDeleteWorkspace:', error.message);
            throw error;
        }
    }

    async getDeletedItems(): Promise<{ 
        workspaces: WorkspaceRow[]; 
        decks: DeckRow[]; 
        lectures: LectureNote[];
        studyGuides: StudyGuide[];
        practiceTests: any[];
        podcasts: PodcastRow[];
    }> {
        const user = await this.ensureSessionReady();

        const [wsRes, deckRes, transcriptRes, guideRes, testRes, podcastRes] = await Promise.all([
            supabase.from('workspaces').select('*').eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('decks').select('*').eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('transcripts').select('*').eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('study_guides').select('*').eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('practice_tests').select('*').eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('podcasts').select('*').eq('profile_id', user.id).not('deleted_at', 'is', null)
        ]);

        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

        const filterAndCleanup = async (data: any[], type: 'workspace' | 'deck' | 'lecture' | 'studyGuide' | 'practiceTest' | 'podcast') => {
            const result: any[] = [];
            for (const row of data || []) {
                const deletedAt = new Date(row.deleted_at).getTime();
                if (deletedAt < threeDaysAgo) {
                    // Cleanup old trash
                    switch (type) {
                        case 'workspace': await this.permanentlyDeleteWorkspace(row.id); break;
                        case 'deck': await this.permanentlyDeleteDeck(row.id); break;
                        case 'lecture': await this.permanentlyDeleteLectureNote(row.id); break;
                        case 'studyGuide': await this.permanentlyDeleteStudyGuide(row.id); break;
                        case 'practiceTest': await this.permanentlyDeletePracticeTest(row.id); break;
                        case 'podcast': await this.permanentlyDeletePodcast(row.id); break;
                    }
                } else {
                    result.push(row);
                }
            }
            return result;
        };

        const [validWorkspaces, validDecks, validLectures, validGuides, validTests, validPodcasts] = await Promise.all([
            filterAndCleanup(wsRes.data || [], 'workspace'),
            filterAndCleanup(deckRes.data || [], 'deck'),
            filterAndCleanup(transcriptRes.data || [], 'lecture'),
            filterAndCleanup(guideRes.data || [], 'studyGuide'),
            filterAndCleanup(testRes.data || [], 'practiceTest'),
            filterAndCleanup(podcastRes.data || [], 'podcast')
        ]);

        const workspaces = validWorkspaces.map(r => ({
            id: r.id,
            profileId: r.profile_id,
            name: r.name,
            color: r.color,
            iconName: r.icon_name,
            parentId: r.parent_id,
            createdAt: new Date(r.created_at).getTime()
        }));

        const decks = validDecks.map(r => ({
            id: r.id,
            userId: r.profile_id,
            workspaceId: r.workspace_id,
            title: r.title,
            description: r.description,
            cardCount: 0,
            createdAt: new Date(r.created_at).getTime(),
            updatedAt: new Date(r.updated_at).getTime()
        }));

        const lectures = validLectures.map(row => {
            const meta = row.metadata as { workspaceId?: string; flashcardDeckId?: string } | null;
            const created = new Date(row.created_at as string).getTime();
            return {
                id: row.id,
                userId: row.profile_id,
                workspaceId: meta?.workspaceId,
                flashcardDeckId: meta?.flashcardDeckId,
                title: row.title || 'Untitled Lecture',
                content: row.content || '',
                date: formatLectureDateLong(created),
                duration: row.duration || '0:00',
                createdAt: created,
                updatedAt: created,
            };
        });

        const studyGuides = validGuides.map(row => ({
            id: row.id,
            userId: row.profile_id,
            workspaceId: row.workspace_id,
            title: row.title,
            topic: row.topic,
            content: row.content,
            createdAt: new Date(row.created_at).getTime(),
        }));

        const practiceTests = validTests.map(row => ({
            id: row.id,
            profileId: row.profile_id,
            workspaceId: row.workspace_id,
            title: row.title,
            score: row.score,
            createdAt: new Date(row.created_at).getTime(),
        }));

        const podcasts = validPodcasts.map(r => ({
            id: r.id,
            userId: r.profile_id,
            workspaceId: r.workspace_id,
            title: r.title,
            script: r.script,
            audioUrl: r.audio_url,
            voiceId: r.voice_id,
            createdAt: new Date(r.created_at).getTime(),
            updatedAt: new Date(r.updated_at).getTime()
        }));

        return { workspaces, decks, lectures, studyGuides, practiceTests, podcasts };
    }

    async createTranscript(params: {
        title: string;
        content: string;
        workspaceId?: string;
        duration?: string;
        summary?: string;
        keyTakeaways?: string[];
        glossary?: { term: string; definition: string }[];
    }): Promise<string> {
        const user = await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('transcripts')
            .insert({
                profile_id: user.id,
                title: params.title,
                content: params.content,
                summary: params.summary,
                key_takeaways: params.keyTakeaways,
                glossary: params.glossary,
                duration: params.duration,
                metadata: {
                    workspaceId: params.workspaceId,
                    source: 'web_record'
                }
            })
            .select('id')
            .single();

        if (error) {
            console.error('[DB] createTranscript:', error.message);
            throw error;
        }
        return data.id;
    }

    async deleteLectureNote(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('transcripts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }

    async restoreLectureNote(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('transcripts')
            .update({ deleted_at: null })
            .eq('id', id);
        if (error) throw error;
    }

    async permanentlyDeleteLectureNote(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase.from('transcripts').delete().eq('id', id);
        if (error) throw error;
    }

    async deleteStudyGuide(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('study_guides')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }

    async restoreStudyGuide(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('study_guides')
            .update({ deleted_at: null })
            .eq('id', id);
        if (error) throw error;
    }

    async permanentlyDeleteStudyGuide(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase.from('study_guides').delete().eq('id', id);
        if (error) throw error;
    }

    async restorePracticeTest(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('practice_tests')
            .update({ deleted_at: null })
            .eq('id', id);
        if (error) throw error;
    }

    async permanentlyDeletePracticeTest(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase.from('practice_tests').delete().eq('id', id);
        if (error) throw error;
    }

    async getPodcasts(): Promise<PodcastRow[]> {
        const user = await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('podcasts')
            .select('*')
            .eq('profile_id', user.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(r => ({
            id: r.id,
            userId: r.profile_id,
            workspaceId: r.workspace_id,
            title: r.title,
            script: r.script,
            audioUrl: r.audio_url,
            voiceId: r.voice_id,
            createdAt: new Date(r.created_at).getTime(),
            updatedAt: new Date(r.updated_at).getTime()
        }));
    }

    async getPodcastsByWorkspace(wsId: string): Promise<PodcastRow[]> {
        await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('podcasts')
            .select('*')
            .eq('workspace_id', wsId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] getPodcastsByWorkspace:', error.message);
            return [];
        }

        return (data || []).map(r => ({
            id: r.id,
            userId: r.profile_id,
            workspaceId: r.workspace_id,
            title: r.title,
            script: r.script,
            audioUrl: r.audio_url,
            voiceId: r.voice_id,
            createdAt: new Date(r.created_at).getTime(),
            updatedAt: new Date(r.updated_at).getTime()
        }));
    }

    async softDeletePodcast(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('podcasts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }

    async restorePodcast(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('podcasts')
            .update({ deleted_at: null })
            .eq('id', id);
        if (error) throw error;
    }

    async permanentlyDeletePodcast(id: string): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase.from('podcasts').delete().eq('id', id);
        if (error) throw error;
    }

    async getWorkspaceContent(wsId?: string): Promise<string> {
        await this.ensureSessionReady();
        let notes: any[] = [];
        let cards: any[] = [];

        if (wsId) {
            [notes, cards] = await Promise.all([
                this.getNotesByWorkspace(wsId),
                this.getFlashcardsByWorkspace(wsId)
            ]);
        } else {
            const user = await this.ensureSessionReady();
            const [notesRes, decksRes] = await Promise.all([
                supabase.from('transcripts').select('*').eq('profile_id', user.id).is('deleted_at', null),
                supabase.from('decks').select('id').eq('profile_id', user.id).is('deleted_at', null)
            ]);
            notes = notesRes.data || [];
            const deckIds = (decksRes.data || []).map(d => d.id);
            if (deckIds.length > 0) {
                const { data } = await supabase.from('cards').select('*').in('deck_id', deckIds);
                cards = data || [];
            }
        }

        let content = '';
        if (notes.length > 0) {
            content += "LECTURE NOTES:\n";
            notes.forEach(n => {
                content += `Title: ${n.title}\nContent: ${n.content}\n\n`;
            });
        }
        if (cards.length > 0) {
            content += "FLASHCARDS:\n";
            cards.forEach(c => {
                content += `Q: ${c.front}\nA: ${c.back}\n\n`;
            });
        }

        return content;
    }

    async savePodcast(params: {
        id: string;
        workspaceId: string;
        title: string;
        audioUrl: string;
        script?: { text: string };
        voiceId?: string;
    }): Promise<void> {
        await this.ensureSessionReady();
        const { error } = await supabase
            .from('podcasts')
            .upsert({
                id: params.id,
                workspace_id: params.workspaceId,
                title: params.title,
                script: params.script,
                audio_url: params.audioUrl,
                voice_id: params.voiceId
            });
        
        if (error) throw error;
    }

    async uploadPodcastAudio(path: string, blob: Blob): Promise<string> {
        const { data, error } = await supabase.storage
            .from('podcasts')
            .upload(path, blob, {
                contentType: 'audio/mpeg',
                upsert: true
            });
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage.from('podcasts').getPublicUrl(path);
        return publicUrl;
    }

    async emptyTrash(): Promise<void> {
        const user = await this.ensureSessionReady();

        await Promise.all([
            supabase.from('workspaces').delete().eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('decks').delete().eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('transcripts').delete().eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('study_guides').delete().eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('practice_tests').delete().eq('profile_id', user.id).not('deleted_at', 'is', null),
            supabase.from('podcasts').delete().eq('profile_id', user.id).not('deleted_at', 'is', null)
        ]);
    }

    // ========== STREAKS & SESSIONS ==========

    async getStudySessions(): Promise<any[]> {
        const user = await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('start_time', { ascending: false });

        if (error) {
            console.error('[DB] getStudySessions:', error.message);
            return [];
        }
        return data || [];
    }

    async saveStudySession(session: {
        id?: string;
        deckId: string;
        startTime: string;
        endTime?: string;
        cardsStudied: number;
        correctCount: number;
        somewhatCount: number;
        wrongCount: number;
    }): Promise<void> {
        const user = await this.ensureSessionReady();
        const { error } = await supabase
            .from('study_sessions')
            .upsert({
                id: session.id || undefined,
                user_id: user.id,
                deck_id: session.deckId,
                start_time: session.startTime,
                end_time: session.endTime,
                cards_studied: session.cardsStudied,
                correct_count: session.correctCount,
                somewhat_count: session.somewhatCount,
                wrong_count: session.wrongCount
            });

        if (error) {
            console.error('[DB] saveStudySession:', error.message);
            throw error;
        }
    }

    async getStreakInfo(): Promise<{ streak_count: number; streak_data: any }> {
        const user = await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('profiles')
            .select('streak_count, streak_data')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('[DB] getStreakInfo:', error.message);
            return { streak_count: 0, streak_data: {} };
        }
        return data;
    }

    async updateStreakInfo(count: number, data: any): Promise<void> {
        const user = await this.ensureSessionReady();
        const { error } = await supabase
            .from('profiles')
            .update({
                streak_count: count,
                streak_data: data
            })
            .eq('id', user.id);

        if (error) {
            console.error('[DB] updateStreakInfo:', error.message);
            throw error;
        }
    }

    async getStudyProgress(): Promise<Record<string, any>> {
        const user = await this.ensureSessionReady();
        const { data, error } = await supabase
            .from('study_progress')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error('[DB] getStudyProgress:', error.message);
            return {};
        }

        const map: Record<string, any> = {};
        (data || []).forEach(row => {
            const key = `${row.deck_id}|${row.card_id}`;
            map[key] = {
                cardId: row.card_id,
                deckId: row.deck_id,
                easeFactor: row.ease_factor,
                interval: row.interval,
                repetitions: row.repetitions,
                status: row.status,
                lastReviewed: row.last_reviewed,
                nextReview: row.next_review,
                timesStudied: row.times_studied,
                timesCorrect: row.times_correct,
                timesSomewhat: row.times_somewhat,
                wrongCount: row.times_wrong
            };
        });
        return map;
    }

    async saveStudyProgress(progress: any): Promise<void> {
        const user = await this.ensureSessionReady();
        const { error } = await supabase
            .from('study_progress')
            .upsert({
                user_id: user.id,
                card_id: progress.cardId,
                deck_id: progress.deckId,
                ease_factor: progress.easeFactor,
                interval: progress.interval,
                repetitions: progress.repetitions,
                status: progress.status,
                last_reviewed: progress.lastReviewed,
                next_review: progress.nextReview,
                times_studied: progress.timesStudied,
                times_correct: progress.timesCorrect,
                times_somewhat: progress.timesSomewhat,
                times_wrong: progress.timesWrong
            }, {
                onConflict: 'user_id, card_id'
            });

        if (error) {
            console.error('[DB] saveStudyProgress:', error.message);
            throw error;
        }
    }
}

export const db = new DatabaseService();
