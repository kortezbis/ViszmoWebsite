import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Trash2, FolderOpen, Mic, BookMarked, Eraser } from 'lucide-react'
import { clearTrash, getTrashItems, removeTrashItem, type TrashedItem, type TrashedItemKind } from '../lib/browserTrash'

const KIND_LABEL: Record<TrashedItemKind, string> = {
  workspace: 'Workspace',
  lecture: 'Lecture',
  study_guide: 'Study guide',
}

const KIND_ICON: Record<TrashedItemKind, ReactNode> = {
  workspace: <FolderOpen size={18} className="text-brand-primary shrink-0" />,
  lecture: <Mic size={18} className="text-red-400 shrink-0" />,
  study_guide: <BookMarked size={18} className="text-amber-400 shrink-0" />,
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashedItem[]>(() => getTrashItems())
  const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setItems(getTrashItems())
  }, [])

  // Hold-to-delete logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isDeleteHolding) {
      timer = setTimeout(() => {
        const id = isDeleteHolding
        setIsDeleteHolding(null)
        if (id === 'empty-trash') {
          clearTrash()
          refresh()
        } else if (id.startsWith('remove-')) {
          const parts = id.replace('remove-', '').split('|')
          if (parts.length === 2) {
            removeTrashItem(parts[0], parts[1] as TrashedItemKind)
            refresh()
          }
        }
      }, 1000)
    }
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [isDeleteHolding, refresh])

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-2">Trash</h1>
          <p className="text-foreground-secondary text-sm sm:text-base max-w-xl">
            Items you delete are removed from your account. This list is a local history on this browser only — use it to
            remember what you removed. Clearing an entry here does not restore data.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className={`hold-to-delete-container !w-auto !inline-flex ${isDeleteHolding === 'empty-trash' ? 'hold-to-delete-active' : ''}`}
            onMouseDown={() => setIsDeleteHolding('empty-trash')}
            onMouseUp={() => setIsDeleteHolding(null)}
            onMouseLeave={() => setIsDeleteHolding(null)}
            onTouchStart={() => setIsDeleteHolding('empty-trash')}
            onTouchEnd={() => setIsDeleteHolding(null)}
          >
            <div className="hold-to-delete-progress" />
            <div className="relative z-10 flex items-center gap-2">
              <Eraser size={16} />
              <span>{isDeleteHolding === 'empty-trash' ? 'Hold to confirm' : 'Empty trash'}</span>
            </div>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 border border-dashed border-border rounded-3xl bg-surface-hover/20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-foreground-muted mb-4">
            <Trash2 size={28} />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Trash is empty</h2>
          <p className="text-foreground-secondary text-sm max-w-md">
            When you delete a workspace, lecture, or study guide from the library, a short record will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 sm:gap-3">
          {items.map((item) => (
            <li
              key={`${item.kind}-${item.id}`}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-surface border border-border shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="mt-0.5">{KIND_ICON[item.kind]}</div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    {KIND_LABEL[item.kind]}
                    {item.subtitle ? ` · ${item.subtitle}` : ''} ·{' '}
                    {new Date(item.deletedAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`hold-to-delete-container !w-auto !inline-flex !bg-surface !border-border !border ${isDeleteHolding === `remove-${item.id}|${item.kind}` ? 'hold-to-delete-active' : ''}`}
                onMouseDown={() => setIsDeleteHolding(`remove-${item.id}|${item.kind}`)}
                onMouseUp={() => setIsDeleteHolding(null)}
                onMouseLeave={() => setIsDeleteHolding(null)}
                onTouchStart={() => setIsDeleteHolding(`remove-${item.id}|${item.kind}`)}
                onTouchEnd={() => setIsDeleteHolding(null)}
              >
                <div className="hold-to-delete-progress" />
                <div className="relative z-10 flex items-center gap-2">
                  <Trash2 size={14} />
                  <span>{isDeleteHolding === `remove-${item.id}|${item.kind}` ? 'Hold to confirm' : 'Remove'}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
