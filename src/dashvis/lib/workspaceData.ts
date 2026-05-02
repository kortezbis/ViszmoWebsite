import { supabase } from './supabase'

export type WsWorkspace = {
  id: string
  title: string
  colorHex: string
  parentId: string | null
}

export type WsSubWorkspace = WsWorkspace & {
  stats: { cardCount: number; mastery: number; subdeckCount: number }
}

export type WsFlashcard = {
  id: string
  deckId: string
  workspaceId?: string
  front: string
  back: string
  frontImage?: string
  backImage?: string
  isStarred?: boolean
  createdAt: number
}

export type WsLectureNote = {
  id: string
  title: string
  date: string
  duration: string
  flashcardDeckId?: string
}

export type WsStudyGuide = {
  id: string
  title: string
  topic: string | null
}

export type WsPodcast = {
  id: string
  title: string
  script: {
    title: string
    intro: string
    segments: { speaker: string; text: string }[]
    outro: string
  }
}

export type WsDeck = {
  id: string
  title: string
  workspaceId: string | null
}

function mapWorkspace(row: {
  id: string
  name: string
  color: string | null
  parent_id: string | null
}): WsWorkspace {
  return {
    id: row.id,
    title: row.name,
    colorHex: row.color || '#3B82F6',
    parentId: row.parent_id,
  }
}

export async function getWorkspaceById(id: string): Promise<WsWorkspace | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('workspaces').select('*').eq('id', id).single()
  if (error || !data) return null
  return mapWorkspace(data as { id: string; name: string; color: string | null; parent_id: string | null })
}

export async function getSubWorkspaces(parentId: string): Promise<WsWorkspace[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as { id: string; name: string; color: string | null; parent_id: string | null }[]).map(
    mapWorkspace
  )
}

export async function getWorkspaceStats(
  wsId: string,
  userId?: string
): Promise<{ cardCount: number; mastery: number; subdeckCount: number }> {
  if (!supabase) return { cardCount: 0, mastery: 0, subdeckCount: 0 }

  // 1. Get direct sub-workspaces
  const { data: subWorkspaces } = await supabase
    .from('workspaces')
    .select('id')
    .eq('parent_id', wsId)
  
  const subdeckCount = subWorkspaces?.length || 0

  // 2. Resolve the current user ID properly
  let effectiveUserId = userId
  if (!effectiveUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    effectiveUserId = user?.id
  }
  
  if (!effectiveUserId) {
    return { cardCount: 0, mastery: 0, subdeckCount: 0 }
  }

  // 3. Fetch all workspaces and decks for this user once
  const [{ data: allWs }, { data: allDecks }] = await Promise.all([
    supabase.from('workspaces').select('id, parent_id').eq('profile_id', effectiveUserId),
    supabase.from('decks').select('id, workspace_id').eq('profile_id', effectiveUserId)
  ])

  if (!allWs) return { cardCount: 0, mastery: 0, subdeckCount: 0 }

  // 4. Build the descendant set (the tree of this workspace)
  const descendantIds = new Set<string>([wsId])
  let added = true
  while (added) {
    added = false
    allWs.forEach((w: any) => {
      if (w.parent_id && descendantIds.has(w.parent_id) && !descendantIds.has(w.id)) {
        descendantIds.add(w.id)
        added = true
      }
    })
  }

  // 5. Identify all decks in this hierarchy
  const hierarchyDeckIds = (allDecks || [])
    .filter((d: any) => d.workspace_id && descendantIds.has(d.workspace_id))
    .map((d: any) => d.id)

  const directSubCount = allWs.filter((w: any) => w.parent_id === wsId).length

  if (hierarchyDeckIds.length === 0) {
    return { cardCount: 0, mastery: 0, subdeckCount: directSubCount }
  }

  // 6. Get total card count across these decks
  const { count, error: countError } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .in('deck_id', hierarchyDeckIds)

  if (countError) {
    console.error('[getWorkspaceStats] countError', countError)
  }

  return { 
    cardCount: count || 0, 
    mastery: 0, 
    subdeckCount: directSubCount 
  }
}

export async function getDecksByWorkspace(wsId: string): Promise<WsDeck[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('decks')
    .select('id, title, workspace_id')
    .eq('workspace_id', wsId)
    .order('updated_at', { ascending: false })
  if (error || !data) return []
  return (data as { id: string; title: string; workspace_id: string | null }[]).map((row) => ({
    id: row.id,
    title: row.title || 'Flashcards',
    workspaceId: row.workspace_id,
  }))
}

export async function getNotesByWorkspace(wsId: string): Promise<WsLectureNote[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .filter('metadata->>workspaceId', 'eq', wsId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (
    data as {
      id: string
      title: string | null
      created_at: string
      duration: string | null
      metadata?: { flashcardDeckId?: string }
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title?.trim() || 'Untitled Lecture',
    date: new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    duration: row.duration || '0:00',
    flashcardDeckId: row.metadata?.flashcardDeckId,
  }))
}

export async function getStudyGuidesByWorkspace(wsId: string): Promise<WsStudyGuide[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('study_guides')
    .select('id, title, topic, created_at')
    .eq('workspace_id', wsId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as { id: string; title: string | null; topic: string | null }[]).map((row) => ({
    id: row.id,
    title: row.title?.trim() || 'Untitled',
    topic: row.topic,
  }))
}

export async function getPodcastsByWorkspace(wsId: string): Promise<WsPodcast[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('podcasts')
    .select('id, title, script')
    .eq('workspace_id', wsId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as any[]).map((row) => ({
    id: row.id,
    title: row.title,
    script: row.script,
  }))
}

/**
 * Flashcards in this workspace’s decks only (not child workspace), matching `getFlashcardsByWorkspace(ws, false)`.
 */
export async function getFlashcardsByWorkspaceCurrent(wsId: string): Promise<WsFlashcard[]> {
  if (!supabase) return []
  const { data: deckRows, error: decksError } = await supabase
    .from('decks')
    .select('id, workspace_id')
    .eq('workspace_id', wsId)
  if (decksError || !deckRows?.length) return []

  const deckIdToWorkspace = new Map(deckRows.map((d: { id: string; workspace_id: string }) => [d.id, d.workspace_id] as const))
  const deckIds = deckRows.map((d: { id: string }) => d.id)

  const { data, error } = await supabase
    .from('cards')
    .select('id, deck_id, front, back, image, back_image, is_starred, created_at')
    .in('deck_id', deckIds)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return (
    data as {
      id: string
      deck_id: string
      front: string
      back: string
      image: string | null
      back_image: string | null
      is_starred: boolean
      created_at: string
    }[]
  ).map(
    (row) => ({
      id: row.id,
      deckId: row.deck_id,
      workspaceId: deckIdToWorkspace.get(row.deck_id) ?? undefined,
      front: row.front ?? '',
      back: row.back ?? '',
      frontImage: row.image ?? undefined,
      backImage: row.back_image ?? undefined,
      isStarred: row.is_starred,
      createdAt: new Date(row.created_at).getTime(),
    })
  )
}

export async function getFlashcardsByDeckId(deckId: string): Promise<WsFlashcard[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('cards')
    .select('id, deck_id, front, back, image, back_image, is_starred, created_at')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return (data as any[]).map(row => ({
    id: row.id,
    deckId: row.deck_id,
    front: row.front ?? '',
    back: row.back ?? '',
    frontImage: row.image ?? undefined,
    backImage: row.back_image ?? undefined,
    isStarred: row.is_starred,
    createdAt: new Date(row.created_at).getTime(),
  }))
}

export function getPreferredFlashcardDeckId(
  decks: WsDeck[],
  notes: WsLectureNote[]
): string | undefined {
  if (decks.length === 0) return undefined
  const linked = new Set<string>()
  for (const n of notes) {
    if (n.flashcardDeckId) linked.add(n.flashcardDeckId)
  }
  const nonLecture = decks.filter((d) => !linked.has(d.id))
  if (nonLecture.length > 0) return nonLecture[0].id
  return decks[0].id
}

export type WorkspaceBundle = {
  workspace: WsWorkspace | null
  subWorkspaces: WsSubWorkspace[]
  cards: WsFlashcard[]
  notes: WsLectureNote[]
  studyGuides: WsStudyGuide[]
  podcasts: WsPodcast[]
  decks: WsDeck[]
  stats: { cardCount: number; mastery: number; subdeckCount: number }
}

export async function fetchWorkspaceBundle(workspaceId: string, userId?: string): Promise<WorkspaceBundle> {
  if (!supabase) {
    return {
      workspace: null,
      subWorkspaces: [],
      cards: [],
      notes: [],
      studyGuides: [],
      podcasts: [],
      decks: [],
      stats: { cardCount: 0, mastery: 0, subdeckCount: 0 },
    }
  }

  const [root, subList, notes, studyGuides, podcasts, cards, stats] = await Promise.all([
    getWorkspaceById(workspaceId),
    getSubWorkspaces(workspaceId),
    getNotesByWorkspace(workspaceId),
    getStudyGuidesByWorkspace(workspaceId),
    getPodcastsByWorkspace(workspaceId),
    getFlashcardsByWorkspaceCurrent(workspaceId),
    getWorkspaceStats(workspaceId, userId),
  ])

  const decks = await getDecksByWorkspace(workspaceId)

  const subWithStats: WsSubWorkspace[] = await Promise.all(
    subList.map(async (sw) => {
      const s = await getWorkspaceStats(sw.id, userId)
      return { ...sw, stats: s }
    })
  )

  return {
    workspace: root,
    subWorkspaces: subWithStats,
    cards,
    notes,
    studyGuides,
    podcasts,
    decks,
    stats,
  }
}

/**
 * All cards in the root workspace plus every child workspace (matches iOS “Study all decks”)
 */
export async function fetchRootStudyAllBundle(rootWorkspaceId: string): Promise<{
  cards: WsFlashcard[]
  decks: WsDeck[]
  cardCount: number
}> {
  // 1. Get ALL workspaces for this user
  const { data: allWs } = await supabase
    .from('workspaces')
    .select('id, parent_id')
    .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)

  if (!allWs) return { cards: [], decks: [], cardCount: 0 }

  // 2. Find all descendants
  const descendantIds = new Set<string>([rootWorkspaceId])
  let added = true
  while (added) {
    added = false
    allWs.forEach((w: any) => {
      if (w.parent_id && descendantIds.has(w.parent_id) && !descendantIds.has(w.id)) {
        descendantIds.add(w.id)
        added = true
      }
    })
  }

  // 3. Fetch bundles and merge
  const cards: WsFlashcard[] = []
  const decks: WsDeck[] = []
  
  await Promise.all(Array.from(descendantIds).map(async (id) => {
    const b = await fetchWorkspaceBundle(id)
    cards.push(...b.cards)
    decks.push(...b.decks)
  }))
  
  const uniqueDecks = Array.from(new Map(decks.map(d => [d.id, d])).values())
  return { cards, decks: uniqueDecks, cardCount: cards.length }
}

// ——— mutations (same as IOSApp-Vis `database.ts`) ———

export async function updateWorkspaceName(wsId: string, name: string): Promise<void> {
  if (!supabase) throw new Error('Not configured')
  const { error } = await supabase.from('workspaces').update({ name: name.trim() }).eq('id', wsId)
  if (error) throw error
}

export async function createWorkspace(
  userId: string,
  name: string,
  color: string,
  parentId?: string
): Promise<WsWorkspace> {
  if (!supabase) throw new Error('Not configured')
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      profile_id: userId,
      name: name.trim(),
      color: color || '#3B82F6',
      icon_name: 'folder',
      parent_id: parentId || null,
    })
    .select()
    .single()
  if (error || !data) throw error || new Error('Create failed')
  return mapWorkspace(data as { id: string; name: string; color: string | null; parent_id: string | null })
}

export async function deleteWorkspaceCascading(wsId: string): Promise<void> {
  if (!supabase) throw new Error('Not configured')
  const { error } = await supabase.from('workspaces').delete().eq('id', wsId)
  if (error) throw error
}

export async function createDeckInWorkspace(userId: string, title: string, workspaceId: string): Promise<string> {
  if (!supabase) throw new Error('Not configured')
  const { data, error } = await supabase
    .from('decks')
    .insert({ profile_id: userId, title, workspace_id: workspaceId })
    .select('id')
    .single()
  if (error || !data) throw error || new Error('Create deck failed')
  return (data as { id: string }).id
}

export async function addCardsToDeck(
  deckId: string,
  items: { front: string; back: string }[]
): Promise<void> {
  if (!supabase) throw new Error('Not configured')
  if (items.length === 0) return
  const { error } = await supabase.from('cards').insert(
    items.map((c) => ({
      deck_id: deckId,
      front: c.front,
      back: c.back,
    }))
  )
  if (error) throw error
}

export async function updateFlashcard(
  id: string,
  updates: { front?: string; back?: string; frontImage?: string | null; backImage?: string | null; isStarred?: boolean }
): Promise<void> {
  if (!supabase) throw new Error('Not configured')
  const u: Record<string, string | boolean | null> = {}
  if (updates.front !== undefined) u.front = updates.front
  if (updates.back !== undefined) u.back = updates.back
  if (updates.frontImage !== undefined) u.image = updates.frontImage
  if (updates.backImage !== undefined) u.back_image = updates.backImage
  if (updates.isStarred !== undefined) u.is_starred = updates.isStarred
  if (Object.keys(u).length === 0) return
  const { error } = await supabase.from('cards').update(u).eq('id', id)
  if (error) throw error
}

export async function deleteFlashcard(id: string): Promise<void> {
  if (!supabase) throw new Error('Not configured')
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}

export function buildStudyScopes(
  cards: WsFlashcard[],
  decks: WsDeck[]
): { id: string; label: string; count: number; color: string; isAll?: boolean }[] {
  if (cards.length === 0) return []
  const byDeck = new Map<string, number>()
  for (const c of cards) {
    byDeck.set(c.deckId, (byDeck.get(c.deckId) || 0) + 1)
  }
  const palette = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#0EA5E9', '#F43F5E']
  const scopes: { id: string; label: string; count: number; color: string; isAll?: boolean }[] = [
    { id: 'all', label: 'All Cards', count: cards.length, color: '#3B82F6', isAll: true },
  ]
  let i = 0
  for (const d of decks) {
    const n = byDeck.get(d.id) || 0
    if (n > 0) {
      scopes.push({
        id: d.id,
        label: d.title,
        count: n,
        color: palette[i % palette.length],
      })
      i += 1
    }
  }
  return scopes
}
export async function savePodcast(
  userId: string,
  workspaceId: string,
  title: string,
  script: any
): Promise<string> {
  if (!supabase) throw new Error('Not configured')
  const { data, error } = await supabase
    .from('podcasts')
    .insert({
      profile_id: userId,
      workspace_id: workspaceId,
      title,
      script,
    })
    .select('id')
    .single()
  if (error || !data) throw error || new Error('Save podcast failed')
  return (data as { id: string }).id
}
