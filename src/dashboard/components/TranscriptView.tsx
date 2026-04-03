import { FileText, Download } from 'lucide-react';

export function TranscriptView() {
    return (
        <div className="w-full max-w-4xl mx-auto p-8 space-y-8">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground">Your Transcripts</h2>
                <p className="text-foreground-secondary mt-2">View and analyze your saved lecture transcripts</p>
            </div>

            <div className="bg-surface rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-border">
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
        </div>
    );
}
