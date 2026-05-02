import type { ReactNode } from 'react'
import { Zap, BookOpen, PenLine, Mic, Target, Shuffle } from 'lucide-react'

export type StudyModeMeta = {
  id: string
  label: string
  description: string
  icon: ReactNode
  color: string
  bg: string
  text: string
  isPro: boolean
}

export const STUDY_MODES: StudyModeMeta[] = [
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Classic flip-card practice. Tap to reveal the answer.',
    icon: <BookOpen size={22} />,
    color: '#3B82F6',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    isPro: false,
  },
  {
    id: 'rapidfire',
    label: 'Rapid Fire',
    description: 'Speed rounds — race the clock and chain streaks.',
    icon: <Zap size={22} />,
    color: '#F59E0B',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    isPro: false,
  },
  {
    id: 'learn',
    label: 'Learn Mastery',
    description: 'Adaptive learning that focuses on your hardest cards.',
    icon: <Target size={22} />,
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    isPro: true,
  },
  {
    id: 'test',
    label: 'Test',
    description: 'Full practice exam — MCQ, T/F, and written answers.',
    icon: <PenLine size={22} />,
    color: '#8B5CF6',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    isPro: true,
  },
  {
    id: 'match',
    label: 'Match',
    description: 'Drag terms to definitions as fast as possible.',
    icon: <Shuffle size={22} />,
    color: '#EC4899',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    isPro: false,
  },
  {
    id: 'speaking',
    label: 'Speaking Drill',
    description: 'Say the answer out loud — voice recognition checks you.',
    icon: <Mic size={22} />,
    color: '#0EA5E9',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    isPro: true,
  },
]
