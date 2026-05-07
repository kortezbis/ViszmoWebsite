import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import GeneratePodcastForm from '../components/GeneratePodcastForm';

export default function GeneratePodcastPage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();

    return (
        <div className="w-full h-full overflow-y-auto bg-background text-foreground min-h-screen">
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Create podcast</h1>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-6 py-12">
                <div className="p-8 bg-surface border border-border rounded-[32px] shadow-2xl">
                    <GeneratePodcastForm workspaceId={workspaceId} />
                </div>
            </div>
        </div>
    );
}
