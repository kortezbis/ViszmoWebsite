import { Link } from 'react-router-dom';
import { SEO } from '../dashboard/components/SEO';

export const NotFoundPage = () => {
    return (
        <>
            <SEO
                title="Page Not Found | Viszmo"
                description="The page you're looking for doesn't exist."
                noindex={true}
            />
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="text-center max-w-md">
                    <p className="text-sm font-black text-[#0ea5e9] uppercase tracking-widest mb-3">404</p>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Page not found</h1>
                    <p className="text-slate-500 leading-relaxed mb-8">
                        The page you're looking for doesn't exist or may have been moved.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            to="/"
                            className="px-6 py-3 rounded-2xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] transition-colors"
                        >
                            Back to Home
                        </Link>
                        <Link
                            to="/help"
                            className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Help Center
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};
