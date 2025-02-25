
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/SessionProvider";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Nosotros from "@/pages/Nosotros";
import Contacto from "@/pages/Contacto";
import Promotions from "@/pages/Promotions";
import NotFound from "@/pages/NotFound";
import PublicMallProfile from "@/pages/PublicMallProfile";
import AdminMallProfile from "@/pages/AdminMallProfile";
import StoreProfile from "@/pages/StoreProfile";
import PublicStoreProfile from "@/pages/PublicStoreProfile";
import MallManagement from "@/pages/MallManagement";
import Signup from "@/pages/Signup";
import PasswordReset from "@/pages/PasswordReset";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Password reset route outside SessionProvider to prevent automatic redirects */}
          <Route path="/auth/callback" element={<PasswordReset />} />
          
          <SessionProvider>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/mall/:mallId" element={<PublicMallProfile />} />
            <Route path="/admin/mall/:mallId" element={<AdminMallProfile />} />
            <Route path="/store/:storeId/promotions" element={<StoreProfile />} />
            <Route path="/store/:storeId" element={<PublicStoreProfile />} />
            <Route path="/mall-management" element={<MallManagement />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </SessionProvider>
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
