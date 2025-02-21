
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Index } from './pages/Index';
import { SessionProvider } from './components/providers/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Promotions } from './pages/Promotions';
import { MallDetails } from './pages/MallDetails';
import { PublicStoreProfile } from './pages/PublicStoreProfile';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';
import { AboutPage } from './pages/About';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <Header />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/mall/:id" element={<MallDetails />} />
              <Route path="/store/:id" element={<PublicStoreProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
          <Footer />
          <Toaster />
        </QueryClientProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
