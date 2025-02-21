
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

const queryClient = new QueryClient();

// Error fallback component
const ErrorFallback = ({error}: {error: Error}) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-5 bg-white">
      <div className="text-center">
        <h2 className="mb-3 text-2xl font-semibold text-gray-800">Oops! Algo salió mal</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary fallbackRender={({error}) => <ErrorFallback error={error} />}>
      <BrowserRouter>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
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
          </QueryClientProvider>
        </SessionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
