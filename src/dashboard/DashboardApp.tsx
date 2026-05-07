import './dashboard.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import NotificationsPage from './pages/NotificationsPage';
import StreakPage from './pages/StreakPage';
import StudyGuideDetailPage from './pages/StudyGuideDetailPage';
import DeckHubPage from './pages/DeckHubPage';
import PodcastDetailPage from './pages/PodcastDetailPage';
import GeneratePodcastPage from './pages/GeneratePodcastPage';

import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Classic Viszmo dashboard: Layout + React Router. Mounted at /dashboard/*
 * Dashboard layout and routing for the primary application experience.
 */
export default function DashboardApp() {
    const location = useLocation();
    return (
        <ErrorBoundary>
            <div id="viszmo-dashboard-root">
                <ThemeProvider defaultTheme="system">
                    <SettingsProvider>
                        <StudyProgressProvider>
                            <DecksProvider>
                                <SidebarProvider>
                                    <Layout>
                                        <AnimatePresence mode="popLayout">
                                            <motion.div
                                                key={location.pathname}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="flex-1 w-full"
                                            >
                                                <Routes location={location}>
                                                    <Route index element={<DashboardPage />} />
                                                    <Route path="flashcards" element={<GamePage initialModeName="Flashcards" />} />
                                                    <Route path="learn" element={<GamePage initialModeName="Learn" />} />
                                                    <Route path="quiz" element={<GamePage initialModeName="Rapid Fire" />} />
                                                    <Route path="match" element={<GamePage initialModeName="Matching" />} />
                                                    <Route path="written" element={<GamePage initialModeName="Written" />} />
                                                    <Route path="speaking" element={<GamePage initialModeName="Speaking Drill" />} />
                                                    <Route path="test" element={<GamePage initialModeName="Practice Test" />} />
                                                    <Route path="transcripts/:transcriptId" element={<TranscriptDetailPage />} />
                                                    <Route path="transcripts" element={<TranscriptPage />} />
                                                    <Route path="study-guides/:guideId" element={<StudyGuideDetailPage />} />
                                                    <Route path="hub" element={<DeckHubPage />} />
                                                    <Route path="decks/:deckId" element={<DeckDetailPage />} />
                                                    <Route path="workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
                                                    <Route path="workspaces/:workspaceId/podcast/new" element={<GeneratePodcastPage />} />
                                                    <Route path="podcasts/:podcastId" element={<PodcastDetailPage />} />
                                                    <Route path="decks" element={<MyDecksPage />} />
                                                    <Route path="edit-deck" element={<EditDeckPage />} />
                                                    <Route path="edit-deck/:deckId" element={<EditDeckPage />} />
                                                    <Route path="chat" element={<ChatPage />} />
                                                    <Route path="summarizers" element={<SummarizersPage />} />
                                                    <Route path="notifications" element={<NotificationsPage />} />
                                                    <Route path="streak" element={<StreakPage />} />
                                                </Routes>
                                            </motion.div>
                                        </AnimatePresence>
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
