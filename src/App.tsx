import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout, ProtectedRoute, AuthErrorBoundary } from './components';
import { ActiveContextProvider, PreferencesProvider } from './contexts';
import { TeamsPage, GameSimulationPage, ProfilePage, LeaguesPage, LeagueDetailPage, CreateLeaguePage, LeagueStructurePage, SeasonDashboardPage, SchedulePage, StandingsPage, LoginCallbackPage, LandingPage, LeagueManagePage, TeamManagePage, RosterPage, DepthChartPage, DashboardPage } from './pages';

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
        <ActiveContextProvider>
          <PreferencesProvider>
            <BrowserRouter>
              <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/callback" element={<LoginCallbackPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
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
                <Route
                  path="/leagues/:leagueId/manage"
                  element={
                    <ProtectedRoute>
                      <LeagueManagePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:teamId/manage"
                  element={
                    <ProtectedRoute>
                      <TeamManagePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:teamId/roster"
                  element={
                    <ProtectedRoute>
                      <RosterPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:teamId/depth-chart"
                  element={
                    <ProtectedRoute>
                      <DepthChartPage />
                    </ProtectedRoute>
                  }
                />
                </Routes>
              </Layout>
            </BrowserRouter>
          </PreferencesProvider>
        </ActiveContextProvider>
      </AuthErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
