import React from 'react';

export default function SummarizersPage() {
    return (
        <div className="h-full relative overflow-hidden bg-background">
            {/* Dot Pattern Background - School Aesthetic (Exact match with Chat) */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.3] dark:opacity-[0.1]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    color: 'var(--color-foreground-muted)'
                }}
            />

            <main className="flex-1 relative z-10 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground/90">AI Summarizers</h1>
                        <p className="text-foreground-secondary text-lg font-medium">Transform your long documents and lectures into concise insights.</p>
                    </header>

                    {/* Placeholder for content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        {[
                            { name: "Lecture Summarizer", desc: "Convert long recordings into key insights" },
                            { name: "PDF Key Points", desc: "Extract crucial information from any document" },
                            { name: "Video Insights", desc: "Summarize YouTube or local video content" },
                            { name: "Study Guide Generator", desc: "Turn transcripts into structured guides" }
                        ].map((feature, i) => (
                            <div key={i} className="h-48 rounded-3xl border border-border p-8 flex flex-col items-center justify-center text-center bg-surface/50 backdrop-blur-sm group hover:border-brand-primary/40 transition-colors">
                                <h3 className="text-foreground font-bold text-lg mb-2">{feature.name}</h3>
                                <p className="text-foreground-secondary text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
