import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout, ProtectedRoute, AuthErrorBoundary } from './components';
import { HomePage, TeamsPage, GameSimulationPage, ProfilePage, LeaguesPage, LeagueDetailPage, CreateLeaguePage, LeagueStructurePage, SeasonDashboardPage, SchedulePage, StandingsPage, LoginCallbackPage, LandingPage } from './pages';

// Create a QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthErrorBoundary>
        <BrowserRouter>
          <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<LoginCallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <TeamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/simulate"
              element={
                <ProtectedRoute>
                  <GameSimulationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagues"
              element={
                <ProtectedRoute>
                  <LeaguesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagues/create"
              element={
                <ProtectedRoute>
                  <CreateLeaguePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagues/:id"
              element={
                <ProtectedRoute>
                  <LeagueDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagues/:id/structure"
              element={
                <ProtectedRoute>
                  <LeagueStructurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagues/:id/season"
              element={
                <ProtectedRoute>
                  <SeasonDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagues/:id/schedule"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagues/:id/standings"
              element={
                <ProtectedRoute>
                  <StandingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          </Layout>
        </BrowserRouter>
      </AuthErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
