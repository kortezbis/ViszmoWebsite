import './dashboard-v2.css';

import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DecksProvider } from '../contexts/DecksContext';
import { StudyProgressProvider } from '../contexts/StudyProgressContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { DebugProvider } from '../contexts/DebugContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

import { DashboardHomeV2 } from './DashboardHomeV2';
import { VisDashboard2PlaceholderPage } from './VisDashboard2PlaceholderPage';
export default function VisDashboard2App() {
    return (
        <ErrorBoundary>
            <div id="viszmo-dashboard-v2-root">
                <ThemeProvider defaultTheme="system" dashboardRootId="viszmo-dashboard-v2-root">
                    <SettingsProvider>
                        <StudyProgressProvider>
                            <DebugProvider>
                                <DecksProvider>
                                    <Routes>
                                        <Route index element={<DashboardHomeV2 />} />
                                        <Route
                                            path="decks"
                                            element={<VisDashboard2PlaceholderPage title="My Decks" />}
                                        />
                                        <Route
                                            path="transcripts"
                                            element={<VisDashboard2PlaceholderPage title="Transcripts" />}
                                        />
                                        <Route
                                            path="chat"
                                            element={<VisDashboard2PlaceholderPage title="Study Chat" />}
                                        />
                                    </Routes>
                                </DecksProvider>
                            </DebugProvider>
                        </StudyProgressProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </div>
        </ErrorBoundary>
    );
}
