import './dashboard.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import { Layout } from './components/Layout';
import { SidebarProvider } from './contexts/SidebarContext';
import { DecksProvider } from './contexts/DecksContext';
import { StudyProgressProvider } from './contexts/StudyProgressContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DebugProvider } from './contexts/DebugContext';

import EditDeckPage from './pages/EditDeckPage';
import MyDecksPage from './pages/MyDecksPage';
import TranscriptPage from './pages/TranscriptPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import SummarizersPage from './pages/SummarizersPage';
import CanvasPage from './pages/CanvasPage';
import NotificationsPage from './pages/NotificationsPage';
import StreakPage from './pages/StreakPage';

import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Viszmo Dashboard Sub-Application
 *
 * Mounted at /dashboard/* in the root App.tsx router.
 *
 * All styles are scoped to #viszmo-dashboard-root — nothing leaks
 * to the landing page. Dark mode is also scoped to this wrapper div,
 * not document.documentElement.
 */
export default function DashboardApp() {
    return (
        <ErrorBoundary>
            <div id="viszmo-dashboard-root">
                <ThemeProvider defaultTheme="system">
                    <SettingsProvider>
                        <StudyProgressProvider>
                            <DebugProvider>
                                <DecksProvider>
                                    <SidebarProvider>
                                        <Layout>
                                            <Routes>
                                                {/* Dashboard home */}
                                                <Route index element={<DashboardPage />} />

                                                {/* Study modes */}
                                                <Route path="flashcards" element={<GamePage initialModeName="Flashcards" />} />
                                                <Route path="learn" element={<GamePage initialModeName="Learn" />} />
                                                <Route path="quiz" element={<GamePage initialModeName="Rapid Fire" />} />
                                                <Route path="match" element={<GamePage initialModeName="Matching" />} />
                                                <Route path="written" element={<GamePage initialModeName="Written" />} />
                                                <Route path="speaking" element={<GamePage initialModeName="Speaking Drill" />} />
                                                <Route path="test" element={<GamePage initialModeName="Practice Test" />} />

                                                {/* Content */}
                                                <Route path="canvas" element={<CanvasPage />} />
                                                <Route path="transcripts" element={<TranscriptPage />} />
                                                <Route path="decks" element={<MyDecksPage />} />
                                                <Route path="edit-deck" element={<EditDeckPage />} />
                                                <Route path="edit-deck/:deckId" element={<EditDeckPage />} />

                                                {/* Utilities */}
                                                <Route path="chat" element={<ChatPage />} />
                                                <Route path="summarizers" element={<SummarizersPage />} />
                                                <Route path="notifications" element={<NotificationsPage />} />
                                                <Route path="streak" element={<StreakPage />} />
                                            </Routes>
                                        </Layout>
                                    </SidebarProvider>
                                </DecksProvider>
                            </DebugProvider>
                        </StudyProgressProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </div>
        </ErrorBoundary>
    );
}
