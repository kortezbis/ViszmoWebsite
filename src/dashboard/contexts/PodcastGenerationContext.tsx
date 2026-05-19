import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { db } from '../../services/database';
import { invokeAiGateway } from '../../services/aiGateway';
import { useNotifications } from './NotificationsContext';

export interface GeneratingPodcast {
    jobId: string;
    workspaceId: string;
    title: string;
    step: 'script' | 'audio' | 'saving' | 'done' | 'error';
    error?: string;
}

interface PodcastGenerationContextValue {
    generatingJobs: GeneratingPodcast[];
    startGeneration: (params: {
        workspaceId: string;
        content: string;
        titleHint: string;
        language: string;
        podcastType: string;
        duration: string;
        gradeLevel: string;
        focus?: string;
        voice: string;
    }) => string; // returns jobId
}

const PodcastGenerationContext = createContext<PodcastGenerationContextValue | null>(null);

export function PodcastGenerationProvider({ children }: { children: ReactNode }) {
    const [generatingJobs, setGeneratingJobs] = useState<GeneratingPodcast[]>([]);
    const { addNotification } = useNotifications();
    const jobsRef = useRef(generatingJobs);
    jobsRef.current = generatingJobs;

    const updateJob = useCallback((jobId: string, patch: Partial<GeneratingPodcast>) => {
        setGeneratingJobs(prev => prev.map(j => j.jobId === jobId ? { ...j, ...patch } : j));
    }, []);

    const startGeneration = useCallback((params: {
        workspaceId: string;
        content: string;
        titleHint: string;
        language: string;
        podcastType: string;
        duration: string;
        gradeLevel: string;
        focus?: string;
        voice: string;
    }): string => {
        const jobId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const newJob: GeneratingPodcast = {
            jobId,
            workspaceId: params.workspaceId,
            title: `Generating: ${params.titleHint}`,
            step: 'script',
        };

        setGeneratingJobs(prev => [...prev, newJob]);

        // Fire and forget
        (async () => {
            try {
                updateJob(jobId, { step: 'script' });

                const scriptRes = await invokeAiGateway<{ title: string; script: string }>('podcast_script', {
                    content: params.content,
                    language: params.language,
                    podcastType: params.podcastType,
                    duration: params.duration,
                    gradeLevel: params.gradeLevel,
                    focus: params.focus,
                });

                updateJob(jobId, { step: 'audio', title: scriptRes.title || `Podcast: ${params.titleHint}` });

                const audioRes = await invokeAiGateway<{ audioBase64: string; mimeType: string }>('podcast_tts', {
                    text: scriptRes.script,
                    voice: params.voice,
                });

                updateJob(jobId, { step: 'saving' });

                const fileName = `${params.workspaceId || 'global'}/${jobId}.mp3`;
                const byteCharacters = atob(audioRes.audioBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'audio/mpeg' });
                const publicUrl = await db.uploadPodcastAudio(fileName, blob);

                await db.savePodcast({
                    id: jobId,
                    workspaceId: params.workspaceId || '',
                    title: scriptRes.title || `Podcast: ${params.titleHint}`,
                    audioUrl: publicUrl,
                    script: { text: scriptRes.script },
                    voiceId: params.voice,
                });

                updateJob(jobId, { step: 'done', title: scriptRes.title || `Podcast: ${params.titleHint}` });

                addNotification({
                    title: 'Podcast Ready!',
                    message: `"${scriptRes.title || params.titleHint}" is ready to listen.`,
                    time: 'Just now',
                    type: 'podcast',
                });

                // Remove job after a delay
                setTimeout(() => {
                    setGeneratingJobs(prev => prev.filter(j => j.jobId !== jobId));
                }, 5000);

            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Generation failed';
                updateJob(jobId, { step: 'error', error: msg });
                setTimeout(() => {
                    setGeneratingJobs(prev => prev.filter(j => j.jobId !== jobId));
                }, 8000);
            }
        })();

        return jobId;
    }, [updateJob, addNotification]);

    return (
        <PodcastGenerationContext.Provider value={{ generatingJobs, startGeneration }}>
            {children}
        </PodcastGenerationContext.Provider>
    );
}

export function usePodcastGeneration() {
    const ctx = useContext(PodcastGenerationContext);
    if (!ctx) throw new Error('usePodcastGeneration must be used within PodcastGenerationProvider');
    return ctx;
}
