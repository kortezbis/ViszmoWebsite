/** Central list of top-level shell routes. Extend here as you add screens. */
export const PAGE_IDS = [
  'home',
  'library',
  'chat',
  'trash',
  'workspace',
  'lecture',
  'deckDetails',
  'studyAll',
  'cardEditor',
  'flashcardCreator',
  'podcastPlayer',
] as const
export type PageId = (typeof PAGE_IDS)[number]

export function isPageId(value: string): value is PageId {
  return (PAGE_IDS as readonly string[]).includes(value)
}
