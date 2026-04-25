import { Link } from 'react-router-dom';
import { VIS_DASHBOARD_2_BASE } from './paths';

export function DashboardHomeV2() {
    return (
        <div className="max-w-3xl">
            <div className="vd2-pill mb-4">Vis Dashboard 2</div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                New workspace
            </h1>
            <p className="text-foreground-secondary text-base md:text-lg leading-relaxed mb-8">
                This is your parallel shell: same auth and data layer as the main app, scoped styles under{' '}
                <code className="text-sm font-mono text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                    #viszmo-dashboard-v2-root
                </code>
                , and routes under{' '}
                <code className="text-sm font-mono text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                    {VIS_DASHBOARD_2_BASE}
                </code>
                . Build screens here without affecting the classic dashboard.
            </p>

            <div className="rounded-2xl border border-border bg-background-card p-6 shadow-card">
                <h2 className="text-lg font-bold text-foreground mb-2">Quick links</h2>
                <ul className="space-y-2 text-sm text-foreground-secondary">
                    <li>
                        <span className="font-medium text-foreground">Classic dashboard: </span>
                        <Link to="/dashboard" className="text-brand-primary font-semibold hover:underline">
                            /dashboard
                        </Link>
                        <span className="text-foreground-muted"> (unchanged)</span>
                    </li>
                    <li>
                        <span className="font-medium text-foreground">This workspace: </span>
                        <span className="text-foreground-muted">use the sidebar to open stub routes until you replace them.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
