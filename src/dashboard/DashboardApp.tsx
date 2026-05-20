import './dashboard.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { SidebarProvider } from './contexts/SidebarContext';
import { DecksProvider } from './contexts/DecksContext';
import { StudyProgressProvider } from './contexts/StudyProgressContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { PodcastGenerationProvider } from './contexts/PodcastGenerationContext';
import { SettingsProvider } from './contexts/SettingsContext';

const GamePage = lazy(() => import('./pages/GamePage'));
const EditDeckPage = lazy(() => import('./pages/EditDeckPage'));
const MyDecksPage = lazy(() => import('./pages/MyDecksPage'));
const DeckDetailPage = lazy(() => import('./pages/DeckDetailPage'));
const WorkspaceDetailPage = lazy(() => import('./pages/WorkspaceDetailPage'));
const TranscriptPage = lazy(() => import('./pages/TranscriptPage'));
const TranscriptDetailPage = lazy(() => import('./pages/TranscriptDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SummarizersPage = lazy(() => import('./pages/SummarizersPage'));
const StreakPage = lazy(() => import('./pages/StreakPage'));
const StudyGuideDetailPage = lazy(() => import('./pages/StudyGuideDetailPage'));
const DeckHubPage = lazy(() => import('./pages/DeckHubPage'));
const PodcastDetailPage = lazy(() => import('./pages/PodcastDetailPage'));
const GeneratePodcastPage = lazy(() => import('./pages/GeneratePodcastPage'));

import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Classic Viszmo dashboard: Layout + React Router. Mounted at /dashboard/*
 * Dashboard layout and routing for the primary application experience.
 */
export default function DashboardApp({ onOpenDownload, onOpenMobileModal }: { onOpenDownload: () => void, onOpenMobileModal: () => void }) {
    const location = useLocation();
    return (
        <ErrorBoundary>
            <div id="viszmo-dashboard-root">
                <ThemeProvider defaultTheme="system">
                    <SettingsProvider>
                        <StudyProgressProvider>
                            <NotificationsProvider>
                            <DecksProvider>
                            <PodcastGenerationProvider>
                                <SidebarProvider>
                                    <Layout>
                                        <AnimatePresence mode="popLayout">
                                            <motion.div
                                                key={location.pathname}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="h-full w-full min-h-0"
                                            >
                                                <Suspense fallback={
                                                    <div className="flex h-full w-full items-center justify-center bg-background">
                                                        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                }>
                                                    <Routes location={location}>
                                                        <Route index element={<DashboardPage onOpenDownload={onOpenDownload} onOpenMobileModal={onOpenMobileModal} />} />
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
                                                        <Route path="streak" element={<StreakPage />} />
                                                    </Routes>
                                                </Suspense>
                                            </motion.div>
                                        </AnimatePresence>
                                    </Layout>
                                </SidebarProvider>
                            </PodcastGenerationProvider>
                            </DecksProvider>
                            </NotificationsProvider>
                        </StudyProgressProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </div>
        </ErrorBoundary>
    );
}
