import { useEffect } from 'react';
import { CanvasMode } from '../components/CanvasMode';
import { useSidebar } from '../contexts/SidebarContext';

export default function CanvasPage() {
    const { setHideSidebar } = useSidebar();

    useEffect(() => {
        setHideSidebar(true);
        return () => setHideSidebar(false);
    }, [setHideSidebar]);

    return <CanvasMode />;
}
