import { useState } from 'react';
import { X, ChevronRight, Play } from 'lucide-react';
import { STUDY_MODES } from '../data/studyModes';

// ── Types ──────────────────────────────────────────────────────────────────────
export type StudyScopeRow = { id: string; label: string; count: number; color: string; isAll?: boolean }

interface StudyFlowProps {
  onClose: () => void
  /** From workspace cards + decks (see `buildStudyScopes` in workspaceData) */
  studyScopes?: StudyScopeRow[]
  initialModeId?: string
  onStartSession?: (settings: { scopeId: string; modeId: string; cardLimit: number; shuffle: boolean; starredOnly: boolean }) => void
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function StepHeader({ title, subtitle, onBack, onClose, showBack }: {
  title: string; subtitle: string;
  onBack?: () => void; onClose: () => void; showBack: boolean;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
        )}
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
          <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ── Step 1: Scope ───────────────────────────────────────────────────────────────
function ScopePicker({ studyScopes, onSelect, onClose }: { studyScopes: StudyScopeRow[]; onSelect: (id: string) => void; onClose: () => void }) {
  return (
    <div>
      <StepHeader
        title="What do you want to study?"
        subtitle="Pick a scope for this session"
        onClose={onClose}
        showBack={false}
      />
      {studyScopes.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-10 text-center">
          <p className="text-sm text-zinc-400 leading-relaxed">
            No cards in this workspace yet. Add flashcards, then start a study session.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {studyScopes.map((deck) => (
            <button
              key={deck.id}
              type="button"
              onClick={() => onSelect(deck.id)}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                deck.isAll
                  ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: deck.color }}
                />
                <div>
                  <div className={`font-bold text-sm ${deck.isAll ? 'text-blue-300' : 'text-white'}`}>
                    {deck.label}
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">{deck.count} cards</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 2: Mode ────────────────────────────────────────────────────────────────
function ModePicker({ studyScopes, scopeId, onSelect, onBack, onClose }: {
  studyScopes: StudyScopeRow[]
  scopeId: string; onSelect: (modeId: string) => void; onBack: () => void; onClose: () => void;
}) {
  const scope = studyScopes.find(d => d.id === scopeId);
  return (
    <div>
      <StepHeader
        title="Choose a study mode"
        subtitle={scope ? `Studying: ${scope.label}` : 'Select how you want to study'}
        onBack={onBack}
        onClose={onClose}
        showBack
      />
      <div className="grid grid-cols-2 gap-2.5">
        {STUDY_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            className={`group relative flex flex-col gap-3 p-4 rounded-2xl border border-white/[0.06] hover:border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-left`}
          >
            {mode.isPro && (
              <span className="absolute top-3 right-3 text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                PRO
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl ${mode.bg} flex items-center justify-center ${mode.text} group-hover:scale-110 transition-transform`}>
              {mode.icon}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{mode.label}</div>
              <div className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed line-clamp-2">{mode.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 3: Prep ────────────────────────────────────────────────────────────────
function StudyPrep({ studyScopes, scopeId, modeId, onBack, onClose, onStartSession }: {
  studyScopes: StudyScopeRow[]
  scopeId: string; modeId: string; onBack: () => void; onClose: () => void;
  onStartSession?: (settings: { scopeId: string; modeId: string; cardLimit: number; shuffle: boolean; starredOnly: boolean }) => void
}) {
  const scope = studyScopes.find(d => d.id === scopeId);
  const mode  = STUDY_MODES.find(m => m.id === modeId);
  const [cardLimit, setCardLimit] = useState(20);
  const [shuffle, setShuffle]     = useState(true);
  const [starredOnly, setStarredOnly] = useState(false);
  const total = Math.max(0, scope?.count ?? 0);
  const cap = total > 0 ? total : 1;

  return (
    <div>
      <StepHeader
        title={mode?.label ?? 'Study Prep'}
        subtitle={scope?.label ?? 'Preparing your session'}
        onBack={onBack}
        onClose={onClose}
        showBack
      />

      {/* Mode description */}
      <div className={`flex items-center gap-3 p-3.5 rounded-2xl mb-5 ${mode?.bg} border border-white/5`}>
        <div className={`w-9 h-9 rounded-xl ${mode?.bg} flex items-center justify-center ${mode?.text} shrink-0`}>
          {mode?.icon}
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{mode?.description}</p>
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Card Limit */}
        <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
          <div>
            <div className="text-white text-sm font-bold">Question Limit</div>
            <div className="text-zinc-500 text-xs mt-0.5">How many cards in this run</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCardLimit(Math.max(1, cardLimit - 5))}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-bold text-sm transition-colors"
            >−</button>
            <span className="text-white font-bold text-sm w-8 text-center">{Math.min(cardLimit, cap)}</span>
            <button
              type="button"
              onClick={() => setCardLimit(Math.min(cap, cardLimit + 5))}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-bold text-sm transition-colors"
            >+</button>
          </div>
        </div>

        {/* Shuffle */}
        <button
          type="button"
          onClick={() => setShuffle(!shuffle)}
          className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:bg-white/[0.05] transition-colors w-full text-left"
        >
          <div>
            <div className="text-white text-sm font-bold">Shuffle Cards</div>
            <div className="text-zinc-500 text-xs mt-0.5">Randomize card order each run</div>
          </div>
          <div className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors ${shuffle ? 'bg-blue-500' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-all shadow ${shuffle ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Starred Only */}
        <button
          type="button"
          onClick={() => setStarredOnly(!starredOnly)}
          className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:bg-white/[0.05] transition-colors w-full text-left"
        >
          <div>
            <div className="text-white text-sm font-bold">Starred Cards Only</div>
            <div className="text-zinc-500 text-xs mt-0.5">Study only cards you've starred</div>
          </div>
          <div className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors ${starredOnly ? 'bg-amber-500' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-all shadow ${starredOnly ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={() => {
          onStartSession?.({
            scopeId,
            modeId,
            cardLimit: Math.min(cardLimit, cap),
            shuffle,
            starredOnly,
          })
          onClose()
        }}
        className={`w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-90 active:scale-[0.98]`}
        style={{ backgroundColor: mode?.color ?? '#3B82F6', boxShadow: `0 8px 24px ${mode?.color ?? '#3B82F6'}40` }}
      >
        <Play size={18} className="fill-white" />
        Start Session
      </button>
    </div>
  );
}

// ── Root Component ──────────────────────────────────────────────────────────────
export default function StudyFlow({ onClose, studyScopes = [], initialModeId, onStartSession }: StudyFlowProps) {
  const [step, setStep]     = useState<1 | 2 | 3>(1);
  const [scopeId, setScopeId] = useState<string>('');
  const [modeId, setModeId]   = useState<string>(initialModeId ?? '');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed z-[210] bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
        <div className="bg-[#141414] border border-white/[0.07] rounded-t-3xl sm:rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] p-6 pb-8 sm:pb-6 max-h-[90vh] overflow-y-auto">

          {/* Step indicator */}
          <div className="flex gap-1.5 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full flex-1 transition-all duration-500 ${step >= s ? 'bg-blue-500' : 'bg-white/10'}`}
              />
            ))}
          </div>

          {step === 1 && (
            <ScopePicker
              studyScopes={studyScopes}
              onClose={onClose}
              onSelect={(id) => {
                setScopeId(id)
                if (initialModeId) {
                  setModeId(initialModeId)
                  setStep(3)
                  return
                }
                setStep(2)
              }}
            />
          )}
          {step === 2 && (
            <ModePicker
              studyScopes={studyScopes}
              scopeId={scopeId}
              onBack={() => setStep(1)}
              onClose={onClose}
              onSelect={(id) => { setModeId(id); setStep(3); }}
            />
          )}
          {step === 3 && (
            <StudyPrep
              studyScopes={studyScopes}
              scopeId={scopeId}
              modeId={modeId}
              onBack={() => setStep(2)}
              onClose={onClose}
              onStartSession={onStartSession}
            />
          )}
        </div>
      </div>
    </>
  );
}
