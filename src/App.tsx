import './App.css'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Toaster as UIToaster } from '@/components/ui/toaster'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'; // Added import

// Lazy imports for code splitting and better performance
const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PasswordReset = lazy(() => import('./pages/PasswordReset'))
const Signup = lazy(() => import('./pages/Signup'))
const About = lazy(() => import('./pages/About'))
const Nosotros = lazy(() => import('./pages/Nosotros'))
const Contacto = lazy(() => import('./pages/Contacto'))
const Promotions = lazy(() => import('./pages/Promotions'))
const PublicMallProfile = lazy(() => import('./pages/PublicMallProfile'))
const PublicStoreProfile = lazy(() => import('./pages/PublicStoreProfile'))
const AdminMallProfile = lazy(() => import('./pages/AdminMallProfile'))
const StoreProfile = lazy(() => import('./pages/StoreProfile'))
const MallDetails = lazy(() => import('./pages/MallDetails'))
const MallManagement = lazy(() => import('./pages/MallManagement'))
const AllPromos = lazy(() => import('./pages/AllPromos'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" storageKey="promocerca-theme">
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ErrorBoundary fallback={<div>Algo ha ido mal</div>}>
              <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Cargando...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/password-reset" element={<PasswordReset />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/nosotros" element={<Nosotros />} />
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/admin/promotions" element={<Promotions />} />
                  <Route path="/admin/mall/:id" element={<AdminMallProfile />} />
                  <Route path="/admin/store/:id" element={<StoreProfile />} />
                  <Route path="/mall/:id" element={<PublicMallProfile />} />
                  <Route path="/store/:id" element={<PublicStoreProfile />} />
                  <Route path="/mall-details/:id" element={<MallDetails />} />
                  <Route path="/mall-management/:mallId" element={<MallManagement />} />
                  <Route path="/allpromos" element={<AllPromos />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Toaster />
            <UIToaster />
            <PWAInstallPrompt /> {/* Added PWAInstallPrompt */}
          </SessionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App