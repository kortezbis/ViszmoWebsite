import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Calendar, CheckCircle2, Clock,
    MoreVertical, Trash2, Edit3, X, GraduationCap,
    AlertCircle, ChevronRight, FileText, Target
} from 'lucide-react';
import { useClasses, type SyllabusItem, type StudyClass } from '../contexts/ClassesContext';
import { useDebug } from '../contexts/DebugContext';
import { FadeInUp } from '../components/ui/MotionWrapper';

// ============================================
// ADD CLASS MODAL
// ============================================

function AddClassModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { addClass, canAddClass, maxClasses, classes } = useClasses();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [instructor, setInstructor] = useState('');
    const [schedule, setSchedule] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        addClass({
            name: name.trim(),
            code: code.trim() || undefined,
            instructor: instructor.trim() || undefined,
            schedule: schedule.trim() || undefined,
            color: '', // Will be auto-assigned
        });

        setName('');
        setCode('');
        setInstructor('');
        setSchedule('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background-elevated border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">Add New Class</h2>
                        <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                            <X className="w-5 h-5 text-foreground-muted" />
                        </button>
                    </div>
                    <p className="text-sm text-foreground-muted mt-1">
                        {classes.length}/{maxClasses} classes used
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Class Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., Introduction to Psychology"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Course Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="e.g., PSY 101"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Instructor</label>
                        <input
                            type="text"
                            value={instructor}
                            onChange={e => setInstructor(e.target.value)}
                            placeholder="e.g., Dr. Smith"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Schedule</label>
                        <input
                            type="text"
                            value={schedule}
                            onChange={e => setSchedule(e.target.value)}
                            placeholder="e.g., MWF 10:00 AM"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || !canAddClass}
                            className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Class
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ============================================
// ADD SYLLABUS ITEM MODAL
// ============================================

function AddSyllabusItemModal({
    isOpen,
    onClose,
    classId,
    editItem
}: {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    editItem?: SyllabusItem;
}) {
    const { addSyllabusItem, updateSyllabusItem } = useClasses();
    const [title, setTitle] = useState(editItem?.title || '');
    const [description, setDescription] = useState(editItem?.description || '');
    const [type, setType] = useState<SyllabusItem['type']>(editItem?.type || 'topic');
    const [dueDate, setDueDate] = useState(editItem?.dueDate?.split('T')[0] || '');
    const [weekNumber, setWeekNumber] = useState(editItem?.weekNumber?.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const itemData = {
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            weekNumber: weekNumber ? parseInt(weekNumber) : undefined,
        };

        if (editItem) {
            updateSyllabusItem(classId, editItem.id, itemData);
        } else {
            addSyllabusItem(classId, itemData);
        }

        onClose();
    };

    if (!isOpen) return null;

    const typeOptions: { value: SyllabusItem['type']; label: string; icon: string }[] = [
        { value: 'topic', label: 'Topic/Lecture', icon: '📚' },
        { value: 'exam', label: 'Exam', icon: '📝' },
        { value: 'quiz', label: 'Quiz', icon: '❓' },
        { value: 'assignment', label: 'Assignment', icon: '📄' },
        { value: 'project', label: 'Project', icon: '🎯' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background-elevated border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">
                            {editItem ? 'Edit Item' : 'Add Syllabus Item'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                            <X className="w-5 h-5 text-foreground-muted" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Chapter 5: Memory"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {typeOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setType(opt.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${type === opt.value
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-surface border border-border text-foreground hover:border-brand-primary'
                                        }`}
                                >
                                    <span className="mr-1">{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Week #</label>
                            <input
                                type="number"
                                value={weekNumber}
                                onChange={e => setWeekNumber(e.target.value)}
                                placeholder="1"
                                min="1"
                                max="20"
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Any additional notes..."
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-foreground resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editItem ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ============================================
// CLASS CARD
// ============================================

function ClassCard({ classData, onSelect }: { classData: StudyClass; onSelect: () => void }) {
    const { deleteClass, getClassProgress } = useClasses();
    const [showMenu, setShowMenu] = useState(false);
    const progress = getClassProgress(classData.id);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-card border border-border rounded-2xl p-6 hover:shadow-card-hover transition-all cursor-pointer group relative"
            onClick={onSelect}
        >
            {/* Color indicator */}
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ backgroundColor: classData.color }}
            />

            {/* Menu */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-colors opacity-0 group-hover:opacity-100"
                >
                    <MoreVertical className="w-4 h-4 text-foreground-muted" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-background-elevated border border-border rounded-xl shadow-lg z-10 py-1 min-w-[120px]">
                        <button
                            onClick={e => { e.stopPropagation(); deleteClass(classData.id); }}
                            className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex items-start gap-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: classData.color }}
                >
                    {classData.code ? classData.code.slice(0, 2).toUpperCase() : classData.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{classData.name}</h3>
                    {classData.code && (
                        <p className="text-sm text-foreground-muted">{classData.code}</p>
                    )}
                    {classData.instructor && (
                        <p className="text-xs text-foreground-muted mt-1">{classData.instructor}</p>
                    )}
                </div>
            </div>

            {/* Progress */}
            {progress.total > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-foreground-muted mb-2">
                        <span>{progress.completed} / {progress.total} items</span>
                        <span>{progress.percentage}%</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress.percentage}%`,
                                backgroundColor: classData.color
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Stats row */}
            <div className="mt-4 flex items-center gap-4 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {classData.syllabus.length} items
                </span>
                {classData.schedule && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {classData.schedule}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// ============================================
// CLASS DETAIL VIEW
// ============================================

function ClassDetailView({ classData, onBack }: { classData: StudyClass; onBack: () => void }) {
    const { toggleSyllabusItemComplete, deleteSyllabusItem, getClassProgress } = useClasses();
    const [addItemOpen, setAddItemOpen] = useState(false);
    const [editItem, setEditItem] = useState<SyllabusItem | undefined>();
    const progress = getClassProgress(classData.id);

    const getTypeIcon = (type: SyllabusItem['type']) => {
        switch (type) {
            case 'exam': return '📝';
            case 'quiz': return '❓';
            case 'assignment': return '📄';
            case 'project': return '🎯';
            default: return '📚';
        }
    };

    const getTypeColor = (type: SyllabusItem['type']) => {
        switch (type) {
            case 'exam': return 'bg-error/10 text-error';
            case 'quiz': return 'bg-warning/10 text-warning';
            case 'assignment': return 'bg-brand-primary/10 text-brand-primary';
            case 'project': return 'bg-success/10 text-success';
            default: return 'bg-surface text-foreground-muted';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (dateStr: string) => {
        return new Date(dateStr) < new Date() && !classData.syllabus.find(i => i.dueDate === dateStr)?.completed;
    };

    // Group items by week
    const itemsByWeek = classData.syllabus.reduce((acc, item) => {
        const week = item.weekNumber || 0;
        if (!acc[week]) acc[week] = [];
        acc[week].push(item);
        return acc;
    }, {} as Record<number, SyllabusItem[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                    <ChevronRight className="w-5 h-5 rotate-180 text-foreground-muted" />
                </button>
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: classData.color }}
                >
                    {classData.code ? classData.code.slice(0, 2).toUpperCase() : classData.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">{classData.name}</h1>
                    <p className="text-foreground-muted">
                        {classData.code && `${classData.code} • `}
                        {classData.instructor || 'No instructor set'}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-background-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">Course Progress</span>
                    <span className="text-2xl font-bold" style={{ color: classData.color }}>
                        {progress.percentage}%
                    </span>
                </div>
                <div className="h-3 bg-surface rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: classData.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <p className="text-sm text-foreground-muted mt-2">
                    {progress.completed} of {progress.total} items completed
                </p>
            </div>

            {/* Add Item Button */}
            <button
                onClick={() => setAddItemOpen(true)}
                className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-foreground-muted hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Syllabus Item
            </button>

            {/* Syllabus Items */}
            {classData.syllabus.length === 0 ? (
                <div className="text-center py-12">
                    <Target className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <h3 className="font-bold text-foreground mb-2">No syllabus items yet</h3>
                    <p className="text-foreground-muted text-sm">
                        Add topics, exams, and assignments to track your progress
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(itemsByWeek)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([week, items]) => (
                            <div key={week}>
                                {Number(week) > 0 && (
                                    <h3 className="text-sm font-bold text-foreground-muted uppercase tracking-wider mb-3">
                                        Week {week}
                                    </h3>
                                )}
                                <div className="space-y-2">
                                    {items.map(item => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            className={`bg-background-card border border-border rounded-xl p-4 flex items-center gap-4 group ${item.completed ? 'opacity-60' : ''
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleSyllabusItemComplete(classData.id, item.id)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.completed
                                                    ? 'bg-success border-success text-white'
                                                    : 'border-border hover:border-success'
                                                    }`}
                                            >
                                                {item.completed && <CheckCircle2 className="w-4 h-4" />}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(item.type)}`}>
                                                        {getTypeIcon(item.type)} {item.type}
                                                    </span>
                                                    {item.dueDate && isOverdue(item.dueDate) && (
                                                        <span className="text-xs font-medium text-error flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className={`font-medium text-foreground mt-1 ${item.completed ? 'line-through' : ''}`}>
                                                    {item.title}
                                                </h4>
                                                {item.description && (
                                                    <p className="text-sm text-foreground-muted mt-1">{item.description}</p>
                                                )}
                                            </div>

                                            {item.dueDate && (
                                                <div className="text-right shrink-0">
                                                    <span className={`text-sm font-medium ${isOverdue(item.dueDate) ? 'text-error' : 'text-foreground-muted'
                                                        }`}>
                                                        {formatDate(item.dueDate)}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditItem(item)}
                                                    className="p-2 rounded-lg hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteSyllabusItem(classData.id, item.id)}
                                                    className="p-2 rounded-lg hover:bg-error/10 text-foreground-muted hover:text-error transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {(addItemOpen || editItem) && (
                    <AddSyllabusItemModal
                        isOpen={addItemOpen || !!editItem}
                        onClose={() => { setAddItemOpen(false); setEditItem(undefined); }}
                        classId={classData.id}
                        editItem={editItem}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// MAIN PAGE
// ============================================

// ... (existing code)

export default function ClassesPage() {
    const { classes: rawClasses, canAddClass, getUpcomingItems, getOverdueItems } = useClasses();
    const { debugEmpty } = useDebug();
    const [addClassOpen, setAddClassOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    const classes = debugEmpty ? [] : rawClasses;
    const selectedClass = selectedClassId ? classes.find(c => c.id === selectedClassId) : null;
    const upcomingItems = debugEmpty ? [] : getUpcomingItems(7);
    const overdueItems = debugEmpty ? [] : getOverdueItems();

    if (selectedClass) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <ClassDetailView
                    classData={selectedClass}
                    onBack={() => setSelectedClassId(null)}
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <FadeInUp>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-foreground">My Classes</h1>
                        <p className="text-foreground-muted mt-1">Track your syllabus and stay on top of your courses</p>
                    </div>
                    <button
                        onClick={() => setAddClassOpen(true)}
                        disabled={!canAddClass}
                        className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        Add Class
                    </button>
                </div>
            </FadeInUp>

            {/* Alerts */}
            {overdueItems.length > 0 && (
                <FadeInUp delay={0.1}>
                    <div className="bg-error/10 border border-error/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-error shrink-0" />
                        <div>
                            <p className="font-medium text-error">
                                {overdueItems.length} overdue item{overdueItems.length > 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-error/80">
                                {overdueItems.map(i => i.item.title).join(', ')}
                            </p>
                        </div>
                    </div>
                </FadeInUp>
            )}

            {/* Classes Grid */}
            {classes.length === 0 ? (
                <FadeInUp delay={0.2}>
                    <div className="text-center py-20 bg-background-card border border-border rounded-3xl">
                        <GraduationCap className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No classes yet</h2>
                        <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                            Add your first class to start tracking your syllabus and staying on top of your studies.
                        </p>
                        <button
                            onClick={() => setAddClassOpen(true)}
                            className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Class
                        </button>
                    </div>
                </FadeInUp>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {classes.map((c, i) => (
                        <FadeInUp key={c.id} delay={0.1 * i}>
                            <ClassCard
                                classData={c}
                                onSelect={() => setSelectedClassId(c.id)}
                            />
                        </FadeInUp>
                    ))}
                </div>
            )}

            {/* Upcoming Section */}
            {upcomingItems.length > 0 && (
                <FadeInUp delay={0.3}>
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-primary" />
                            Coming Up This Week
                        </h2>
                        <div className="bg-background-card border border-border rounded-2xl divide-y divide-border">
                            {upcomingItems.slice(0, 5).map(({ classId, className, color, item }) => (
                                <div
                                    key={item.id}
                                    className="p-4 flex items-center gap-4 hover:bg-surface-hover cursor-pointer transition-colors"
                                    onClick={() => setSelectedClassId(classId)}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{item.title}</p>
                                        <p className="text-sm text-foreground-muted">{className}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(item.dueDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-foreground-muted capitalize">{item.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeInUp>
            )}

            {/* Modals */}
            <AnimatePresence>
                {addClassOpen && (
                    <AddClassModal isOpen={addClassOpen} onClose={() => setAddClassOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
