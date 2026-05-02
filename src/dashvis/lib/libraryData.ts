import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './supabase'

/** Matches the structure produced by iOS `fetchLibraryData` (library.tsx) + database.ts. */
export type LibraryWorkspace = {
  id: string
  title: string
  colorHex: string
  stats: { cardCount: number; subdeckCount: number; mastery: number }
}

export type LibraryLecture = {
  id: string
  title: string
  date: string
  duration: string
}

export type LibraryStudyGuide = {
  id: string
  title: string
  topic: string | null
}

type DeckRow = {
  id: string
  workspace_id: string | null
  profile_id: string
  title: string | null
  created_at: string
  updated_at: string
  cards?: { count: number }[] | null
}

type WorkspaceRow = {
  id: string
  profile_id: string
  name: string
  color: string | null
  parent_id: string | null
  created_at: string
}

type TranscriptRow = {
  id: string
  title: string | null
  duration: string | null
  created_at: string
}

type StudyGuideRow = {
  id: string
  title: string | null
  topic: string | null
  created_at: string
}

function formatLectureDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function buildLibraryError(label: string, message: string): string {
  return `${label}: ${message}`
}

/** Build per-deck card counts (fallback if embedded `cards(count)` is unavailable). */
async function getCardCountByDeckId(client: SupabaseClient, deckIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (deckIds.length === 0) return map
  const { data, error } = await client.from('cards').select('deck_id').in('deck_id', deckIds)
  if (error || !data) return map
  for (const row of data as { deck_id: string }[]) {
    const id = row.deck_id
    map.set(id, (map.get(id) || 0) + 1)
  }
  return map
}

/**
 * Fetches library lists using the same Supabase tables and aggregation rules as IOSApp-Vis
 * (`app/(tabs)/library.tsx` + `services/database.ts`).
 */
export async function fetchLibrarySnapshot(userId: string): Promise<{
  workspaces: LibraryWorkspace[]
  lectures: LibraryLecture[]
  studyGuides: LibraryStudyGuide[]
}> {
  if (!supabase) {
    return { workspaces: [], lectures: [], studyGuides: [] }
  }
  const client = supabase

  // 1. Fetch ALL workspaces for the user
  const wsRes = await client
    .from('workspaces')
    .select('id, profile_id, name, color, parent_id, created_at')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  if (wsRes.error) {
    throw new Error(`Could not load workspaces: ${wsRes.error.message}`)
  }

  const wsList: WorkspaceRow[] = (wsRes.data || []) as WorkspaceRow[]
  const wsIds = wsList.map(w => w.id)

  // 2. Fetch ALL decks for these workspaces
  const decksRes = await client
    .from('decks')
    .select('id, workspace_id, profile_id, title, created_at, updated_at')
    .in('workspace_id', wsIds)

  if (decksRes.error) {
    throw new Error(`Could not load decks: ${decksRes.error.message}`)
  }

  const rawDecks = (decksRes.data || []) as DeckRow[]
  const deckIds = rawDecks.map(d => d.id)

  // 3. Fetch card counts for all these decks
  const cardCountMap = await getCardCountByDeckId(client, deckIds)

  // 4. Map decks to deckModels
  const deckModels = rawDecks.map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    cardCount: cardCountMap.get(row.id) || 0,
  }))

  const transcriptRes = await client.from('transcripts').select('id, title, duration, created_at').eq('profile_id', userId).order('created_at', { ascending: false })
  const guidesRes = await client.from('study_guides').select('id, title, topic, created_at').eq('profile_id', userId).order('created_at', { ascending: false })

  const blockingErrors: string[] = []
  if (transcriptRes.error) {
    blockingErrors.push(buildLibraryError('lectures', transcriptRes.error.message))
  }
  if (guidesRes.error) {
    blockingErrors.push(buildLibraryError('study guides', guidesRes.error.message))
  }
  if (blockingErrors.length > 0) {
    throw new Error(`Could not load library data (${blockingErrors.join(' | ')})`)
  }

  const wsListMapped = wsList.map((row) => ({
    id: row.id,
    userId: row.profile_id,
    title: row.name,
    colorHex: row.color || '#3B82F6',
    parentId: row.parent_id,
  }))

  const rootWorkspaces = wsListMapped.filter((ws) => !ws.parentId)
  const rootWorkspaceIds = new Set(rootWorkspaces.map((ws) => ws.id))
  
  // Recursive subdeckCount
  const subWorkspaceCounts = new Map<string, number>()
  wsListMapped.forEach(ws => {
    if (!ws.parentId) return
    
    // Walk up to find root
    let current = ws
    while (current.parentId) {
      if (rootWorkspaceIds.has(current.parentId)) {
        subWorkspaceCounts.set(current.parentId, (subWorkspaceCounts.get(current.parentId) || 0) + 1)
        break
      }
      const parent = wsListMapped.find(w => w.id === current.parentId)
      if (!parent) break
      current = parent
    }
  })
  const deckCardCounts = new Map<string, number>()


  deckModels.forEach((deck) => {
    if (!deck.workspaceId) return
    
    // Walk up the tree to find the root workspace
    let currentWsId = deck.workspaceId
    let rootWsId: string | null = null
    
    // Safety break for cycles, though there shouldn't be any
    for (let i = 0; i < 10; i++) {
      if (rootWorkspaceIds.has(currentWsId)) {
        rootWsId = currentWsId
        break
      }
      const ws = wsListMapped.find(w => w.id === currentWsId)
      if (!ws?.parentId) break
      currentWsId = ws.parentId
    }
    
    if (rootWsId) {
      deckCardCounts.set(rootWsId, (deckCardCounts.get(rootWsId) || 0) + deck.cardCount)
    }
  })

  const workspaces: LibraryWorkspace[] = rootWorkspaces.map((ws) => ({
    id: ws.id,
    title: ws.title,
    colorHex: ws.colorHex,
    stats: {
      cardCount: deckCardCounts.get(ws.id) || 0,
      mastery: 0,
      subdeckCount: subWorkspaceCounts.get(ws.id) || 0,
    },
  }))

  const lectures: LibraryLecture[] = ((transcriptRes.data || []) as TranscriptRow[]).map((row) => ({
    id: row.id,
    title: row.title?.trim() || 'Untitled Lecture',
    date: formatLectureDate(row.created_at),
    duration: row.duration || '0:00',
  }))

  const studyGuides: LibraryStudyGuide[] = ((guidesRes.data || []) as StudyGuideRow[]).map((row) => ({
    id: row.id,
    title: row.title?.trim() || 'Untitled',
    topic: row.topic,
  }))

  return { workspaces, lectures, studyGuides }
}
