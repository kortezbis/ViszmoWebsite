import { useRef, useEffect, useState } from 'react';
import { useDecks } from '../contexts/DecksContext';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, GripVertical, X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { generateCardsFromPrompt } from '../../services/flashcardGenerator';
import { useNavigate, useParams } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../contexts/DecksContext';

interface SortableCardProps {
    card: Card;
    index: number;
    updateCard: (id: string, updates: Partial<Card>) => void;
    deleteCard: (id: string) => void;
    handleImageUpload: (id: string) => void;
}

function SortableCard({ card, index, updateCard, deleteCard, handleImageUpload }: SortableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-background-card border border-border rounded-xl p-5 shadow-sm hover:border-brand-primary/50 transition-colors group relative"
        >
            {/* Card Header: Number & Actions */}
            <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
                <span className="text-foreground-muted font-bold text-sm w-8">{index + 1}</span>
                <div className="flex items-center gap-4 text-foreground-muted">
                    <button
                        className="cursor-grab hover:text-foreground transition-colors touch-none"
                        title="Drag to reorder"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => void deleteCard(card.id)}
                        className="hover:text-error transition-colors"
                        title="Delete card"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Card Inputs Row */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Term Column */}
                <div className="flex-1 w-full space-y-2">
                    <textarea
                        value={card.front}
                        onChange={(e) => updateCard(card.id, { front: e.target.value })}
                        className="w-full bg-background border-2 border-transparent focus:border-brand-primary/50 text-foreground p-4 rounded-xl resize-none min-h-[80px] focus:outline-none transition-all placeholder-foreground-muted/30 font-medium leading-relaxed"
                        placeholder="Enter term..."
                    />
                    <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block px-1">Term</label>
                </div>

                {/* Definition Column */}
                <div className="flex-[1.5] w-full space-y-2">
                    <textarea
                        value={card.back}
                        onChange={(e) => updateCard(card.id, { back: e.target.value })}
                        className="w-full bg-background border-2 border-transparent focus:border-brand-primary/50 text-foreground p-4 rounded-xl resize-none min-h-[80px] focus:outline-none transition-all placeholder-foreground-muted/30 leading-relaxed"
                        placeholder="Enter definition..."
                    />
                    <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block px-1">Definition</label>
                </div>

                {/* Image Button */}
                <div className="shrink-0 w-full md:w-24 mt-1 md:mt-0">
                    {card.image ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden group/image border border-border">
                            <img src={card.image} alt="visual" className="w-full h-full object-cover" />
                            <button
                                onClick={() => updateCard(card.id, { image: undefined })}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleImageUpload(card.id)}
                            className="w-24 h-24 border-2 border-dashed border-border hover:border-brand-primary hover:bg-brand-primary/5 rounded-xl flex flex-col items-center justify-center gap-2 text-foreground-muted hover:text-brand-primary transition-all group/btn"
                        >
                            <ImageIcon className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Image</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EditDeckPage() {
    const { deckId } = useParams<{ deckId?: string }>();
    const {
        activeDeck,
        setActiveDeck,
        updateDeckTitle,
        addCard,
        updateCard,
        deleteCard,
        setCards,
        createDeck,
        getDeckById,
        decksLoading,
    } = useDecks();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const creatingDeckRef = useRef(false);

    useEffect(() => {
        if (decksLoading) return;

        if (deckId) {
            const deck = getDeckById(deckId);
            if (deck) {
                setActiveDeck(deckId);
            } else {
                navigate('/dashboard/decks');
            }
            return;
        }

        if (creatingDeckRef.current) return;
        creatingDeckRef.current = true;
        void (async () => {
            const newDeckId = await createDeck('Untitled Deck');
            setActiveDeck(newDeckId);
            navigate(`/dashboard/edit-deck/${newDeckId}`, { replace: true });
        })();
    }, [deckId, decksLoading, getDeckById, setActiveDeck, createDeck, navigate]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && activeDeck && active.id !== over.id) {
            const oldIndex = activeDeck.cards.findIndex((card) => card.id === active.id);
            const newIndex = activeDeck.cards.findIndex((card) => card.id === over.id);
            setCards(arrayMove(activeDeck.cards, oldIndex, newIndex));
        }
    };

    const handleAddCard = () => {
        void addCard({
            front: '',
            back: '',
            starred: false
        });
        // Scroll to bottom after adding
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleImageUpload = (id: string) => {
        // In a real app, this would open a file picker
        const url = prompt("Enter image URL (mock):");
        if (url) {
            updateCard(id, { image: url });
        }
    };

    // ── Magic Add (AI) ──────────────────────────────────────────────────────────
    const [magicPrompt, setMagicPrompt] = useState('');
    const [isMagicLoading, setIsMagicLoading] = useState(false);
    const [magicError, setMagicError] = useState<string | null>(null);

    const handleMagicAdd = async () => {
        const prompt = magicPrompt.trim();
        if (!prompt || isMagicLoading || !activeDeck) return;
        setIsMagicLoading(true);
        setMagicError(null);
        try {
            // Build context from existing cards so AI doesn't duplicate
            const context = activeDeck.cards
                .slice(0, 20)
                .map((c) => `${c.front} — ${c.back}`)
                .join('\n');
            const newCards = await generateCardsFromPrompt(prompt, context || undefined);
            if (!newCards.length) throw new Error('AI returned no cards. Try rephrasing your prompt.');
            for (const card of newCards) {
                await addCard({ front: card.front, back: card.back, starred: false });
            }
            setMagicPrompt('');
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (e: unknown) {
            setMagicError(e instanceof Error ? e.message : 'Something went wrong.');
        } finally {
            setIsMagicLoading(false);
        }
    };

    if (!activeDeck) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-foreground-secondary mb-4">Loading deck...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="h-16 px-8 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur z-50 sticky top-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-0.5">Title</label>
                        <input
                            type="text"
                            value={activeDeck.title}
                            onChange={(e) => updateDeckTitle(e.target.value)}
                            className="bg-transparent text-lg font-bold text-foreground focus:outline-none focus:border-b-2 focus:border-brand-primary transition-all w-96 placeholder-foreground-muted/50 hover:bg-surface-hover/50 rounded px-1 -ml-1"
                            placeholder="Deck Title"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground-secondary">
                        {activeDeck.cards.length} cards
                    </span>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-primary px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all"
                    >
                        <span>Done</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 relative">
                <FadeInUp className="max-w-5xl mx-auto space-y-4 pb-32">
                    {/* AI Prompt Bar */}
                    <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 mb-2 shadow-sm space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shrink-0">
                                {isMagicLoading
                                    ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    : <Sparkles className="w-5 h-5 text-white" />}
                            </div>
                            <input
                                type="text"
                                value={magicPrompt}
                                onChange={(e) => setMagicPrompt(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') void handleMagicAdd(); }}
                                placeholder="What would you like to add? (e.g. 'Add 5 cards about cell biology')"
                                disabled={isMagicLoading}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-foreground placeholder:text-foreground-muted/60 disabled:opacity-50"
                            />
                            <button
                                onClick={() => void handleMagicAdd()}
                                disabled={!magicPrompt.trim() || isMagicLoading}
                                className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isMagicLoading ? 'Adding...' : 'Magic Add'}
                            </button>
                        </div>
                        {magicError && (
                            <div className="flex items-center gap-2 text-xs text-red-500 pl-14">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {magicError}
                            </div>
                        )}
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={activeDeck.cards.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {activeDeck.cards.map((card, index) => (
                                <SortableCard
                                    key={card.id}
                                    card={card}
                                    index={index}
                                    updateCard={updateCard}
                                    deleteCard={deleteCard}
                                    handleImageUpload={handleImageUpload}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    <div ref={scrollRef} />

                    <button
                        onClick={handleAddCard}
                        className="w-full py-6 rounded-xl border-2 border-dashed border-border hover:border-brand-primary hover:bg-brand-primary/5 text-foreground-secondary hover:text-brand-primary font-bold transition-all flex items-center justify-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-surface group-hover:bg-brand-primary text-foreground group-hover:text-white flex items-center justify-center transition-colors">
                            <Plus className="w-5 h-5" />
                        </div>
                        <span>Add New Card</span>
                    </button>
                </FadeInUp>
            </main>
        </div>
    );
}
