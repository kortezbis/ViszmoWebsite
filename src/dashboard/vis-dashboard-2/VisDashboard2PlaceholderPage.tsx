import { Link } from 'react-router-dom';
import { VIS_DASHBOARD_2_BASE } from './paths';

type Props = {
    title: string;
    description?: string;
};

export function VisDashboard2PlaceholderPage({ title, description }: Props) {
    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-foreground-secondary text-sm md:text-base leading-relaxed mb-6">
                {description ??
                    'This route is wired for Vis Dashboard 2. Implement the screen here using the v2 layout and styles — the classic dashboard at /dashboard is unchanged.'}
            </p>
            <Link
                to={VIS_DASHBOARD_2_BASE}
                className="inline-flex text-sm font-semibold text-brand-primary hover:underline"
            >
                ← Back to Vis Dashboard 2 home
            </Link>
        </div>
    );
}
