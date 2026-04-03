import { FadeInUp } from '../components/ui/MotionWrapper';
import { Search, FileText, Download } from 'lucide-react';

export default function TranscriptPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <FadeInUp>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Transcripts</h1>
                        <p className="text-foreground-secondary mt-1">View and analyze your saved lecture transcripts</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                            <input
                                type="text"
                                placeholder="Search transcripts..."
                                className="pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary min-w-[240px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-surface rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-border min-h-[400px]">
                    <div className="w-20 h-20 bg-background-elevated rounded-2xl flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-foreground-muted" />
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3">No transcripts yet</h3>

                    <p className="text-foreground-secondary max-w-md mb-8 leading-relaxed">
                        Use the desktop app to record and transcribe your lectures. They will appear here automatically.
                    </p>

                    <button className="flex items-center gap-2 text-brand-primary font-bold hover:underline transition-all">
                        <span>Download App</span>
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </FadeInUp>
        </div>
    );
}
