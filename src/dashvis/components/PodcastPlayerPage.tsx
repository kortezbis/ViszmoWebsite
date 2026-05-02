import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Play, Pause, Volume2, SkipBack, SkipForward, Podcast as PodcastIcon, Waves, ListMusic } from 'lucide-react'
import { generatePodcastScript, type PodcastScript } from '../lib/aiGateway'
import { savePodcast } from '../lib/workspaceData'
import { useAuth } from '../lib/auth'

type PodcastPlayerPageProps = {
  title: string
  content?: string
  workspaceId?: string
  initialScript?: PodcastScript | null
  onBack: () => void
}

export default function PodcastPlayerPage({ title, content, workspaceId, initialScript, onBack }: PodcastPlayerPageProps) {
  const { userId, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [script, setScript] = useState<PodcastScript | null>(initialScript || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1) // -1 for intro, -2 for outro
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const hasGenerated = useRef(false)

  useEffect(() => {
    // If we already have a script (passed in or already generated), stop loading
    if (initialScript) {
      setScript(initialScript)
      setLoading(false)
      return
    }

    // Wait for auth to settle before deciding whether to generate/save
    if (authLoading) return

    async function load() {
      if (hasGenerated.current) return
      if (!content) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('Generating podcast script for:', title)
        const s = await generatePodcastScript(title, content)
        setScript(s)
        hasGenerated.current = true
        
        // Auto-save to the database so it appears in the library
        if (workspaceId && userId) {
          try {
            console.log('Auto-saving podcast to workspace:', workspaceId)
            await savePodcast(userId, workspaceId, s.title, s)
            console.log('Podcast saved successfully!')
          } catch (e) {
            console.error('Failed to auto-save podcast:', e)
            // We don't block the user if save fails, but they might be annoyed it's not in library
          }
        } else {
          console.warn('Skipping auto-save: missing workspaceId or userId', { workspaceId, userId })
        }
      } catch (err) {
        console.error('Podcast generation error:', err)
        setError(err instanceof Error ? err.message : 'Could not generate podcast')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => {
      if (synth) synth.cancel()
    }
  }, [title, content, synth, initialScript, workspaceId, userId, authLoading])

  const speak = (text: string, onEnd: () => void) => {
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = playbackSpeed
    utterance.pitch = 1
    
    // Find a good voice
    const voices = synth.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onend = onEnd
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Simple progress simulation based on character count
        const charIndex = event.charIndex
        const totalChars = text.length
        setProgress((charIndex / totalChars) * 100)
      }
    }
    
    utteranceRef.current = utterance
    synth.speak(utterance)
    setIsPlaying(true)
  }

  const handlePlayPause = () => {
    if (!synth) return
    if (isPlaying) {
      synth.pause()
      setIsPlaying(false)
    } else {
      if (synth.paused) {
        synth.resume()
        setIsPlaying(true)
      } else {
        startPlayingFrom(currentSegmentIndex === -1 ? -1 : currentSegmentIndex)
      }
    }
  }

  const startPlayingFrom = (index: number) => {
    if (!script) return
    
    if (index === -1) {
      setCurrentSegmentIndex(-1)
      speak(script.intro, () => {
        if (script.segments.length > 0) startPlayingFrom(0)
        else startPlayingFrom(-2)
      })
    } else if (index === -2) {
      setCurrentSegmentIndex(-2)
      speak(script.outro, () => {
        setIsPlaying(false)
        setCurrentSegmentIndex(-1)
        setProgress(100)
      })
    } else {
      setCurrentSegmentIndex(index)
      speak(script.segments[index].text, () => {
        if (index + 1 < script.segments.length) {
          startPlayingFrom(index + 1)
        } else {
          startPlayingFrom(-2)
        }
      })
    }
  }

  const skipForward = () => {
    if (!script) return
    if (currentSegmentIndex === -1) startPlayingFrom(0)
    else if (currentSegmentIndex === -2) return
    else if (currentSegmentIndex + 1 < script.segments.length) startPlayingFrom(currentSegmentIndex + 1)
    else startPlayingFrom(-2)
  }

  const skipBackward = () => {
    if (!script) return
    if (currentSegmentIndex === -1) return
    else if (currentSegmentIndex === 0) startPlayingFrom(-1)
    else if (currentSegmentIndex === -2) startPlayingFrom(script.segments.length - 1)
    else startPlayingFrom(currentSegmentIndex - 1)
  }

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background p-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center animate-pulse">
            <PodcastIcon size={40} className="text-brand-primary" />
          </div>
          <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Generating Podcast...</h2>
        <p className="text-foreground-secondary text-center max-w-sm">
          Viszmo is converting your material into an engaging audio summary. This takes a few seconds.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background p-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Waves size={32} className="text-red-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-3 text-center tracking-tight">Podcast Generation Failed</h2>
        <div className="max-w-md w-full bg-surface-hover border border-border rounded-2xl p-4 mb-8">
          <p className="text-sm text-foreground-secondary font-medium leading-relaxed italic text-center">
            "{error}"
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => {
              setError(null)
              setLoading(true)
              // Trigger reload by resetting state if needed, but the effect will re-run if we just clear error
              window.location.reload() // Force reload for now to be safe
            }} 
            className="px-8 py-3 rounded-2xl bg-brand-primary text-white font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Try Again
          </button>
          <button 
            onClick={onBack} 
            className="px-8 py-3 rounded-2xl bg-surface border border-border text-foreground font-bold text-sm hover:bg-surface-hover transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">Viszmo Podcast</h1>
          <p className="text-xs text-foreground-secondary truncate">{title}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 px-6 py-4 overflow-y-auto lg:overflow-hidden max-w-6xl mx-auto w-full">
        
        {/* Left Side: Player Art & Main Controls */}
        <div className="flex-1 flex flex-col items-center justify-center lg:pb-12">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-[3rem] blur-3xl group-hover:opacity-100 transition-opacity opacity-70"></div>
            <div className="relative w-full h-full bg-surface border border-border rounded-[3rem] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-b from-purple-500 to-indigo-600 flex items-center justify-center relative">
                <PodcastIcon size={120} className="text-white/20 absolute" />
                <div className="z-10 flex flex-col items-center text-center px-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                    <Waves size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white leading-tight mb-2">{script?.title}</h2>
                  <p className="text-white/60 text-sm font-bold tracking-widest uppercase">Viszmo Original</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md">
            {/* Progress Bar */}
            <div className="relative w-full h-1.5 bg-surface-hover rounded-full mb-2 overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-brand-primary transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-8">
              <span>{Math.floor(progress)}% Complete</span>
              <span>
                {currentSegmentIndex === -1 ? 'Intro' : currentSegmentIndex === -2 ? 'Outro' : `Segment ${currentSegmentIndex + 1}/${script?.segments.length}`}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-8 mb-10">
              <button 
                onClick={() => setPlaybackSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                className="w-10 h-10 flex items-center justify-center text-sm font-black text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-full transition-all"
              >
                {playbackSpeed}x
              </button>
              
              <button onClick={skipBackward} className="p-3 text-foreground-secondary hover:text-foreground transition-colors">
                <SkipBack size={28} />
              </button>

              <button 
                onClick={handlePlayPause}
                className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>

              <button onClick={skipForward} className="p-3 text-foreground-secondary hover:text-foreground transition-colors">
                <SkipForward size={28} />
              </button>

              <div className="w-10 h-10 flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-full transition-all">
                <Volume2 size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Script / Chapters */}
        <div className="w-full lg:w-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6 px-2">
            <ListMusic size={18} className="text-brand-primary" />
            <h3 className="font-bold text-foreground">Podcast Chapters</h3>
          </div>
          <div className="flex-1 space-y-3 lg:overflow-y-auto lg:pr-2 pb-10">
            <button 
              onClick={() => startPlayingFrom(-1)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${currentSegmentIndex === -1 ? 'bg-brand-primary/5 border-brand-primary' : 'bg-surface border-border hover:border-brand-primary/30'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentSegmentIndex === -1 ? 'bg-brand-primary text-white' : 'bg-surface-hover text-foreground-muted'}`}>
                {currentSegmentIndex === -1 && isPlaying ? <Waves size={16} /> : <Play size={16} />}
              </div>
              <div className="min-w-0">
                <h4 className={`font-bold text-sm ${currentSegmentIndex === -1 ? 'text-brand-primary' : 'text-foreground'}`}>Introduction</h4>
                <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">{script?.intro}</p>
              </div>
            </button>

            {script?.segments.map((seg, i) => (
              <button 
                key={i}
                onClick={() => startPlayingFrom(i)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${currentSegmentIndex === i ? 'bg-brand-primary/5 border-brand-primary' : 'bg-surface border-border hover:border-brand-primary/30'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentSegmentIndex === i ? 'bg-brand-primary text-white' : 'bg-surface-hover text-foreground-muted'}`}>
                  {currentSegmentIndex === i && isPlaying ? <Waves size={16} /> : <Play size={16} />}
                </div>
                <div className="min-w-0">
                  <h4 className={`font-bold text-sm ${currentSegmentIndex === i ? 'text-brand-primary' : 'text-foreground'}`}>{seg.speaker} Segment {i + 1}</h4>
                  <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">{seg.text}</p>
                </div>
              </button>
            ))}

            <button 
              onClick={() => startPlayingFrom(-2)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${currentSegmentIndex === -2 ? 'bg-brand-primary/5 border-brand-primary' : 'bg-surface border-border hover:border-brand-primary/30'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentSegmentIndex === -2 ? 'bg-brand-primary text-white' : 'bg-surface-hover text-foreground-muted'}`}>
                {currentSegmentIndex === -2 && isPlaying ? <Waves size={16} /> : <Play size={16} />}
              </div>
              <div className="min-w-0">
                <h4 className={`font-bold text-sm ${currentSegmentIndex === -2 ? 'text-brand-primary' : 'text-foreground'}`}>Conclusion</h4>
                <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">{script?.outro}</p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}


