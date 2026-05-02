import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, X, Save, GripVertical, Trash2, Image as ImageIcon, Search } from 'lucide-react'
import { updateFlashcard, type WsFlashcard } from '../lib/workspaceData'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type CardEditorPageProps = {
  title: string
  cards: WsFlashcard[]
  orderStorageKey: string
  initialCardId?: string
  onBack: () => void
  onSaved?: (cards: WsFlashcard[]) => void
}

type EditableCard = WsFlashcard & {
  originalFront: string
  originalBack: string
  originalFrontImage?: string
  originalBackImage?: string
}

type ImageSearchResult = {
  title: string
  url: string
}

interface SortableCardProps {
  card: EditableCard
  index: number
  initialCardId?: string
  updateItem: (id: string, patch: Partial<EditableCard>) => void
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
  handleFilePick: (cardId: string, side: 'frontImage' | 'backImage', file: File | null) => void
  searchTermImages: (cardId: string, query: string) => void
  searchingForCardId: string | null
  termImageSearchResults: Record<string, ImageSearchResult[]>
}

function SortableCard({ 
  card, 
  index, 
  initialCardId,
  updateItem, 
  fileInputRefs, 
  handleFilePick, 
  searchTermImages, 
  searchingForCardId, 
  termImageSearchResults 
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`editor-card-${card.id}`}
      className={`rounded-2xl border p-5 bg-surface transition-colors shadow-sm ${
        isDragging ? 'opacity-50 ring-2 ring-brand-primary border-brand-primary' : 
        card.id === initialCardId ? 'border-brand-primary/40 bg-brand-primary/5' : 'border-border hover:border-border-strong'
      }`}
    >
      {/* Card Header: Number & Actions */}
      <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
        <span className="text-foreground-muted font-black text-xs w-8 uppercase tracking-widest">Card {index + 1}</span>
        <div className="flex items-center gap-4 text-foreground-muted">
          <button
            className="cursor-grab active:cursor-grabbing hover:text-foreground transition-colors touch-none p-1"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={20} />
          </button>
          <button
            onClick={() => updateItem(card.id, { isDeleted: true } as any)} // Optional: soft delete or just filter out
            className="hover:text-red-500 transition-colors p-1"
            title="Delete card"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <input
        ref={(el) => {
          fileInputRefs.current[`front-${card.id}`] = el
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilePick(card.id, 'frontImage', e.target.files?.[0] ?? null)}
      />
      <input
        ref={(el) => {
          fileInputRefs.current[`back-${card.id}`] = el
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilePick(card.id, 'backImage', e.target.files?.[0] ?? null)}
      />

      {/* Card Inputs Row */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Term Column */}
        <div className="flex-1 w-full space-y-2">
          <textarea
            value={card.front}
            onChange={(e) => updateItem(card.id, { front: e.target.value })}
            className="w-full bg-background border-2 border-transparent focus:border-brand-primary/50 text-foreground p-4 rounded-xl resize-none min-h-[100px] focus:outline-none transition-all placeholder-foreground-muted/30 font-medium leading-relaxed shadow-inner"
            placeholder="Enter term..."
          />
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Term</label>
            <button 
              onClick={() => searchTermImages(card.id, card.front)}
              disabled={searchingForCardId === card.id || !card.front.trim()}
              className="text-[10px] font-bold text-brand-primary uppercase tracking-wider hover:opacity-80 disabled:opacity-30 flex items-center gap-1"
            >
              <Search size={10} />
              {searchingForCardId === card.id ? 'Searching...' : 'Auto Image'}
            </button>
          </div>
          
          {card.frontImage && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden group/image border border-border shadow-md">
              <img src={card.frontImage} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => updateItem(card.id, { frontImage: undefined })}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Definition Column */}
        <div className="flex-[1.5] w-full space-y-2">
          <textarea
            value={card.back}
            onChange={(e) => updateItem(card.id, { back: e.target.value })}
            className="w-full bg-background border-2 border-transparent focus:border-brand-primary/50 text-foreground p-4 rounded-xl resize-none min-h-[100px] focus:outline-none transition-all placeholder-foreground-muted/30 leading-relaxed shadow-inner"
            placeholder="Enter definition..."
          />
          <label className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] block px-1">Definition</label>
          
          {card.backImage && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden group/image border border-border shadow-md">
              <img src={card.backImage} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => updateItem(card.id, { backImage: undefined })}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Image Upload Buttons */}
        <div className="shrink-0 flex md:flex-col gap-3 w-full md:w-auto">
          <button
            onClick={() => fileInputRefs.current[`front-${card.id}`]?.click()}
            className="flex-1 md:w-24 md:h-24 border-2 border-dashed border-border hover:border-brand-primary hover:bg-brand-primary/5 rounded-xl flex flex-col items-center justify-center gap-2 text-foreground-muted hover:text-brand-primary transition-all group/btn py-4"
          >
            <ImageIcon className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-wider">Term Pic</span>
          </button>
          <button
            onClick={() => fileInputRefs.current[`back-${card.id}`]?.click()}
            className="flex-1 md:w-24 md:h-24 border-2 border-dashed border-border hover:border-brand-primary hover:bg-brand-primary/5 rounded-xl flex flex-col items-center justify-center gap-2 text-foreground-muted hover:text-brand-primary transition-all group/btn py-4"
          >
            <ImageIcon className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-wider">Def Pic</span>
          </button>
        </div>
      </div>

      {/* Auto Image Search Results */}
      {termImageSearchResults[card.id] && termImageSearchResults[card.id]!.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">Search Results</span>
            <button onClick={() => updateItem(card.id, { termImageSearchResults: [] } as any)} className="text-foreground-muted hover:text-foreground">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {termImageSearchResults[card.id]!.map((result) => (
              <button
                key={`${card.id}-${result.url}`}
                type="button"
                onClick={() => {
                  updateItem(card.id, { frontImage: result.url })
                  // Clear results
                }}
                className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-primary transition-all shadow-sm"
                title={result.title}
              >
                <img src={result.url} alt={result.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CardEditorPage({
  title,
  cards,
  orderStorageKey,
  initialCardId,
  onBack,
  onSaved,
}: CardEditorPageProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchingForCardId, setSearchingForCardId] = useState<string | null>(null)
  const [termImageSearchResults, setTermImageSearchResults] = useState<Record<string, ImageSearchResult[]>>({})
  const [items, setItems] = useState<EditableCard[]>(
    cards.map((card) => ({
      ...card,
      originalFront: card.front,
      originalBack: card.back,
      originalFrontImage: card.frontImage,
      originalBackImage: card.backImage,
    }))
  )
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (!initialCardId) return
    const node = document.getElementById(`editor-card-${initialCardId}`)
    if (!node) return
    setTimeout(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [initialCardId])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking textareas
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id)
        const newIndex = prev.findIndex((item) => item.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const dirtyCount = useMemo(() => {
    return items.filter((item, index) => {
      const source = cards.find((c) => c.id === item.id)
      if (!source) return true
      const orderChanged = cards[index]?.id !== item.id
      return (
        orderChanged ||
        source.front !== item.front ||
        source.back !== item.back ||
        (source.frontImage || '') !== (item.frontImage || '') ||
        (source.backImage || '') !== (item.backImage || '')
      )
    }).length
  }, [items, cards])

  const updateItem = (id: string, patch: Partial<EditableCard>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const handleFilePick = (cardId: string, side: 'frontImage' | 'backImage', file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) return
      updateItem(cardId, { [side]: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const searchTermImages = async (cardId: string, query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    setSearchingForCardId(cardId)
    try {
      const url = new URL('https://commons.wikimedia.org/w/api.php')
      url.searchParams.set('action', 'query')
      url.searchParams.set('generator', 'search')
      url.searchParams.set('gsrsearch', trimmed)
      url.searchParams.set('gsrnamespace', '6')
      url.searchParams.set('gsrlimit', '8')
      url.searchParams.set('prop', 'imageinfo')
      url.searchParams.set('iiprop', 'url')
      url.searchParams.set('iiurlwidth', '480')
      url.searchParams.set('format', 'json')
      url.searchParams.set('origin', '*')

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Image search failed')
      const data = (await response.json()) as {
        query?: { pages?: Record<string, { title?: string; imageinfo?: { thumburl?: string; url?: string }[] }> }
      }
      const pages = data.query?.pages ? Object.values(data.query.pages) : []
      const results: ImageSearchResult[] = pages
        .map((page) => ({
          title: page.title || 'Image',
          url: page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url || '',
        }))
        .filter((item) => item.url.length > 0)
      setTermImageSearchResults((prev) => ({ ...prev, [cardId]: results }))
    } catch {
      setTermImageSearchResults((prev) => ({ ...prev, [cardId]: [] }))
    } finally {
      setSearchingForCardId(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const sourceById = new Map(cards.map((c) => [c.id, c]))
      const updates = items
        .map((item) => {
          const source = sourceById.get(item.id)
          if (!source) return null
          const patch: {
            id: string
            updates: { front?: string; back?: string; frontImage?: string | null; backImage?: string | null }
          } = { id: item.id, updates: {} }
          if (source.front !== item.front) patch.updates.front = item.front
          if (source.back !== item.back) patch.updates.back = item.back
          if ((source.frontImage || '') !== (item.frontImage || '')) patch.updates.frontImage = item.frontImage || null
          if ((source.backImage || '') !== (item.backImage || '')) patch.updates.backImage = item.backImage || null
          return Object.keys(patch.updates).length > 0 ? patch : null
        })
        .filter((v): v is { id: string; updates: { front?: string; back?: string; frontImage?: string | null; backImage?: string | null } } => Boolean(v))

      for (const entry of updates) {
        await updateFlashcard(entry.id, entry.updates)
      }

      localStorage.setItem(orderStorageKey, JSON.stringify(items.map((i) => i.id)))
      onSaved?.(items)
      onBack()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save card changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-background selection:bg-brand-primary/20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-border bg-surface text-foreground hover:bg-surface-hover transition-all"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Back to deck</span>
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-foreground-muted uppercase tracking-[0.2em] hidden sm:block">
              {items.length} Cards Total
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? 'Saving...' : `Save changes${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
            </button>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">Edit Cards</h1>
          <div className="flex items-center gap-2 text-foreground-secondary">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
            <p className="text-sm font-bold uppercase tracking-widest">{title}</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-3 text-sm text-red-500 bg-red-500/5 border border-red-500/10 rounded-2xl px-5 py-4 animate-in fade-in zoom-in duration-300">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
             {error}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((card, index) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  index={index}
                  initialCardId={initialCardId}
                  updateItem={updateItem}
                  fileInputRefs={fileInputRefs}
                  handleFilePick={handleFilePick}
                  searchTermImages={searchTermImages}
                  searchingForCardId={searchingForCardId}
                  termImageSearchResults={termImageSearchResults}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        
        <div className="h-20"></div> {/* Bottom spacing */}
      </div>
    </div>
  )
}
