
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/SessionProvider";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Promotions from "@/pages/Promotions";
import NotFound from "@/pages/NotFound";
import PublicMallProfile from "@/pages/PublicMallProfile";
import AdminMallProfile from "@/pages/AdminMallProfile";
import StoreProfile from "@/pages/StoreProfile";
import PublicStoreProfile from "@/pages/PublicStoreProfile";
import MallManagement from "@/pages/MallManagement";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/mall/:mallId" element={<PublicMallProfile />} />
            <Route path="/admin/mall/:mallId" element={<AdminMallProfile />} />
            <Route path="/store/:storeId/promotions" element={<StoreProfile />} />
            <Route path="/store/:storeId" element={<PublicStoreProfile />} />
            <Route path="/mall-management" element={<MallManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default App;
