import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Pause, Loader2, Podcast } from 'lucide-react';
import { db, type PodcastRow } from '../../services/database';
import { SEO } from '../components/SEO';

export default function PodcastDetailPage() {
    const { podcastId } = useParams<{ podcastId: string }>();
    const navigate = useNavigate();
    
    const [podcast, setPodcast] = useState<PodcastRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadPodcast = async () => {
            if (!podcastId) return;
            setLoading(true);
            try {
                // We don't have a getPodcastById in db yet, let's just fetch all and find it
                const all = await db.getPodcasts();
                const found = all.find(p => p.id === podcastId);
                if (isMounted) setPodcast(found || null);
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadPodcast();
        return () => { isMounted = false; };
    }, [podcastId]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-foreground-secondary min-h-[50vh]">
                <Loader2 className="animate-spin text-brand-primary" size={32} />
                <p className="text-sm font-medium">Loading podcast…</p>
            </div>
        );
    }

    if (!podcast) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-20 px-6">
                <p className="text-foreground-secondary font-medium">Podcast not found or hasn't synced yet.</p>
                <button onClick={() => navigate(-1)} className="text-brand-primary font-bold hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-background text-foreground">
            <SEO title={podcast?.title || 'AI Podcast'} description={`Listen to an AI-generated podcast summary for ${podcast?.title || 'your notes'}.`} />
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">{podcast.title || 'Untitled Podcast'}</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-surface border border-border rounded-3xl p-8 mb-8 flex flex-col items-center justify-center text-center shadow-lg">
                    <div className="w-24 h-24 bg-brand-primary/10 text-brand-primary rounded-3xl flex items-center justify-center mb-6">
                        <Podcast size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{podcast.title}</h2>
                    <p className="text-foreground-secondary mb-8">Generated Audio Podcast</p>
                    
                    {podcast.audioUrl ? (
                        <>
                            <audio 
                                ref={audioRef} 
                                src={podcast.audioUrl} 
                                onEnded={() => setIsPlaying(false)}
                                onPause={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                className="hidden"
                            />
                            <button 
                                onClick={togglePlay}
                                className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white ml-1" />}
                            </button>
                        </>
                    ) : (
                        <div className="px-6 py-3 bg-surface-active rounded-xl text-foreground-secondary text-sm font-medium border border-border">
                            Audio file is not available
                        </div>
                    )}
                </div>

                {podcast.script && podcast.script.text && (
                    <div className="bg-surface border border-border rounded-3xl p-8">
                        <h3 className="text-lg font-bold mb-6">Transcript</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-foreground-secondary">
                                {podcast.script.text}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
