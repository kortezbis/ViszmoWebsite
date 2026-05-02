/** Local archive of items the user removed (reference only; server data is already deleted). */

export type TrashedItemKind = 'workspace' | 'lecture' | 'study_guide'

export type TrashedItem = {
  id: string
  kind: TrashedItemKind
  title: string
  subtitle?: string
  deletedAt: number
}

const STORAGE_KEY = 'viszmo_trash_items_v1'
const MAX_ITEMS = 200

function readRaw(): TrashedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is TrashedItem =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as TrashedItem).id === 'string' &&
        typeof (x as TrashedItem).kind === 'string' &&
        typeof (x as TrashedItem).title === 'string' &&
        typeof (x as TrashedItem).deletedAt === 'number'
    )
  } catch {
    return []
  }
}

function write(items: TrashedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function getTrashItems(): TrashedItem[] {
  return readRaw().sort((a, b) => b.deletedAt - a.deletedAt)
}

export function addTrashItem(item: Omit<TrashedItem, 'deletedAt'>): void {
  const prev = readRaw().filter((x) => !(x.id === item.id && x.kind === item.kind))
  write([{ ...item, deletedAt: Date.now() }, ...prev])
}

export function removeTrashItem(id: string, kind: TrashedItemKind): void {
  write(readRaw().filter((x) => !(x.id === id && x.kind === kind)))
}

export function clearTrash(): void {
  localStorage.removeItem(STORAGE_KEY)
}
