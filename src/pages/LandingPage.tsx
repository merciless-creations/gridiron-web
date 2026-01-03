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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Goal To Go <span className="text-green-500">Football</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Build your dynasty. Manage your roster. Dominate the league.
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            The ultimate online football franchise simulation. Draft players, manage contracts, 
            make trades, and compete against friends in a realistic NFL-style experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => login()}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            
            <button
              onClick={() => login()}
              className="px-8 py-4 bg-transparent border-2 border-gray-500 hover:border-green-500 text-white text-lg font-semibold rounded-lg transition-colors duration-200"
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
    <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export default LandingPage;
