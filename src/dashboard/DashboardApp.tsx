import './dashboard.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import { Layout } from './components/Layout';
import { SidebarProvider } from './contexts/SidebarContext';
import { DecksProvider } from './contexts/DecksContext';
import { StudyProgressProvider } from './contexts/StudyProgressContext';
import { SettingsProvider } from './contexts/SettingsContext';
import EditDeckPage from './pages/EditDeckPage';
import MyDecksPage from './pages/MyDecksPage';
import DeckDetailPage from './pages/DeckDetailPage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import TranscriptPage from './pages/TranscriptPage';
import TranscriptDetailPage from './pages/TranscriptDetailPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import SummarizersPage from './pages/SummarizersPage';
import CanvasPage from './pages/CanvasPage';
import NotificationsPage from './pages/NotificationsPage';
import StreakPage from './pages/StreakPage';

import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Classic Viszmo dashboard: Layout + React Router. Mounted at /dashboard/*
 * Build the dashvis-based experience at /dashboard-v2 (see VisDashboard2App).
 */
export default function DashboardApp() {
    return (
        <ErrorBoundary>
            <div id="viszmo-dashboard-root">
                <ThemeProvider defaultTheme="system">
                    <SettingsProvider>
                        <StudyProgressProvider>
                            <DecksProvider>
                                <SidebarProvider>
                                    <Layout>
                                        <Routes>
                                            <Route index element={<DashboardPage />} />
                                            <Route path="flashcards" element={<GamePage initialModeName="Flashcards" />} />
                                            <Route path="learn" element={<GamePage initialModeName="Learn" />} />
                                            <Route path="quiz" element={<GamePage initialModeName="Rapid Fire" />} />
                                            <Route path="match" element={<GamePage initialModeName="Matching" />} />
                                            <Route path="written" element={<GamePage initialModeName="Written" />} />
                                            <Route path="speaking" element={<GamePage initialModeName="Speaking Drill" />} />
                                            <Route path="test" element={<GamePage initialModeName="Practice Test" />} />
                                            <Route path="canvas" element={<CanvasPage />} />
                                            <Route path="transcripts/:transcriptId" element={<TranscriptDetailPage />} />
                                            <Route path="transcripts" element={<TranscriptPage />} />
                                            <Route path="decks/:deckId" element={<DeckDetailPage />} />
                                            <Route path="workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
                                            <Route path="decks" element={<MyDecksPage />} />
                                            <Route path="edit-deck" element={<EditDeckPage />} />
                                            <Route path="edit-deck/:deckId" element={<EditDeckPage />} />
                                            <Route path="chat" element={<ChatPage />} />
                                            <Route path="summarizers" element={<SummarizersPage />} />
                                            <Route path="notifications" element={<NotificationsPage />} />
                                            <Route path="streak" element={<StreakPage />} />
                                        </Routes>
                                    </Layout>
                                </SidebarProvider>
                            </DecksProvider>
                        </StudyProgressProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </div>
        </ErrorBoundary>
    );
}
