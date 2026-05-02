import './dashboard-v2.css';

import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import DashvisApp from '../../dashvis/DashvisApp';

/**
 * Dashboard v2: same app as the `dashvis` project (NewStudyDashboardSkeleton + pages).
 * Code lives in `src/dashvis/*`. Open /dashboard-v2 when signed in.
 */
export default function VisDashboard2App() {
    useEffect(() => {
        return () => {
            // Theme is scoped to #viszmo-dashboard-v2-root; clear any legacy html.dark from older builds.
            document.documentElement.classList.remove('dark');
        };
    }, []);

    return (
        <ErrorBoundary>
            <div id="viszmo-dashboard-v2-root" className="min-h-screen bg-background text-foreground">
                <DashvisApp />
            </div>
        </ErrorBoundary>
    );
}
