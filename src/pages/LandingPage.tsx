import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export function LandingPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gridiron-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gridiron-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gridiron-bg-primary via-gridiron-bg-secondary to-gridiron-bg-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gridiron-text-primary mb-6">
            Goal To Go <span className="text-gridiron-accent">Football</span>
          </h1>

          <p className="text-xl md:text-2xl text-gridiron-text-secondary mb-8">
            Build your dynasty. Manage your roster. Dominate the league.
          </p>

          <p className="text-lg text-gridiron-text-muted mb-12 max-w-2xl mx-auto">
            The ultimate online football franchise simulation. Draft players, manage contracts,
            make trades, and compete against friends in a realistic NFL-style experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => login()}
              className="px-8 py-4 bg-gridiron-accent hover:bg-emerald-400 text-gridiron-bg-primary text-lg font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>

            <button
              onClick={() => login()}
              className="px-8 py-4 bg-transparent border-2 border-gridiron-border-emphasis hover:border-gridiron-accent text-gridiron-text-primary text-lg font-semibold rounded-lg transition-colors duration-200"
            >
              Sign In
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Build Your Team"
              description="Draft rookies, sign free agents, and build a championship roster."
            />
            <FeatureCard
              title="Manage Finances"
              description="Navigate the salary cap and make smart contract decisions."
            />
            <FeatureCard
              title="Compete Online"
              description="Join leagues with friends and prove you're the best GM."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gridiron-bg-card bg-opacity-50 rounded-xl p-6 border border-gridiron-border-subtle">
      <h3 className="text-xl font-semibold text-gridiron-text-primary mb-2">{title}</h3>
      <p className="text-gridiron-text-secondary">{description}</p>
    </div>
  );
}

export default LandingPage;
