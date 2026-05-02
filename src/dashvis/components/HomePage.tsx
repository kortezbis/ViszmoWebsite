import { Upload, Mic, PlaySquare, FileText, Podcast, FolderOpen } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function HomePage({ onOpenCreate }: { onOpenCreate: (type: 'flashcards' | 'lectures' | 'guides' | 'podcasts') => void }) {
  const { userName, userEmail } = useAuth()
  const first = userName?.split(/\s+/)[0] || userEmail?.split('@')[0]
  return (
    <div className="w-full flex flex-col items-center pt-8">
      
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold font-heading text-foreground mb-8">
          {first ? `Welcome, ${first}` : 'Welcome'}
        </h1>

        {/* Action Cards Row */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          
          {/* Card 1: Upload */}
          <div className="min-w-[240px] flex-1 bg-surface-hover/30 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors snap-start">
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                <Upload size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Upload a file</h3>
              <p className="text-sm text-foreground-secondary leading-relaxed mb-6">
                Get notes or flashcards to practice with.
              </p>
            </div>
            <button className="self-start px-5 py-2 rounded-full bg-surface border border-border text-sm font-bold text-foreground hover:bg-surface-hover transition-colors">
              Upload
            </button>
          </div>

          {/* Card 2: Record */}
          <div className="min-w-[240px] flex-1 bg-surface-hover/30 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors snap-start">
            <div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                <Mic size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Live Record Class</h3>
              <p className="text-sm text-foreground-secondary leading-relaxed mb-6">
                Start recording and let Viszmo turn them into notes.
              </p>
            </div>
            <button className="self-start px-5 py-2 rounded-full bg-surface border border-border text-sm font-bold text-foreground hover:bg-surface-hover transition-colors">
              Record
            </button>
          </div>

          {/* Card 3: Flashcards */}
          <div className="min-w-[240px] flex-1 bg-surface-hover/30 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors snap-start">
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                <PlaySquare size={24} className="text-amber-500 fill-amber-500/20" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Flashcards</h3>
              <p className="text-sm text-foreground-secondary leading-relaxed mb-6">
                Access learn mode, podcasts, or a 1:1 voice tutor.
              </p>
            </div>
            <button className="self-start px-5 py-2 rounded-full bg-surface border border-border text-sm font-bold text-foreground hover:bg-surface-hover transition-colors">
              Create
            </button>
          </div>

          {/* Card 4: Notes */}
          <div className="min-w-[240px] flex-1 bg-surface-hover/30 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors snap-start">
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center mb-4 border border-blue-400/20">
                <FileText size={24} className="text-blue-400 fill-blue-400/20" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Notes</h3>
              <p className="text-sm text-foreground-secondary leading-relaxed mb-6">
                Access practice tests, podcasts, or a 1:1 voice tutor.
              </p>
            </div>
            <button className="self-start px-5 py-2 rounded-full bg-surface border border-border text-sm font-bold text-foreground hover:bg-surface-hover transition-colors">
              Create
            </button>
          </div>

          <div className="min-w-[240px] flex-1 bg-surface-hover/30 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-surface-hover/50 transition-colors snap-start">
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                <Podcast size={24} className="text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Podcast</h3>
              <p className="text-sm text-foreground-secondary leading-relaxed mb-6">
                Upload a file to generate a podcast.
              </p>
            </div>
            <button 
              onClick={() => onOpenCreate('podcasts')}
              className="self-start px-5 py-2 rounded-full bg-surface border border-border text-sm font-bold text-foreground hover:bg-surface-hover transition-colors"
            >
              Create
            </button>
          </div>

        </div>

        {/* Empty State Area */}
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="w-16 h-20 bg-blue-500 rounded-lg shadow-lg rotate-[-10deg] absolute -left-4 -top-2 opacity-80"></div>
            <div className="w-16 h-20 bg-surface border-2 border-border rounded-lg shadow-xl relative z-10 flex items-center justify-center">
              <FolderOpen size={32} className="text-foreground-muted" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Start creating or explore resources</h2>
          <p className="text-foreground-secondary max-w-sm">
            Recent files will appear here for quick access
          </p>
        </div>

      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
