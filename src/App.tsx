
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import { SessionProvider } from './components/providers/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Promotions from './pages/Promotions';
import MallDetails from './pages/MallDetails';
import PublicStoreProfile from './pages/PublicStoreProfile';
import NotFound from './pages/NotFound';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';
import { AboutPage } from './pages/About';

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/mall/:id" element={<MallDetails />} />
              <Route path="/store/:id" element={<PublicStoreProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <Toaster />
          </ErrorBoundary>
        </QueryClientProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
