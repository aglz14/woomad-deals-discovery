
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Promotions from "@/pages/Promotions";
import MallManagement from "@/pages/MallManagement";
import StoreProfile from "@/pages/StoreProfile";
import MallDetails from "@/pages/MallDetails";
import NotFound from "@/pages/NotFound";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n/config";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/mall/:mallId" element={<MallDetails />} />
            <Route path="/mall/:mallId/manage" element={<MallManagement />} />
            <Route path="/store/:storeId" element={<StoreProfile />} />
            <Route path="/store/:storeId/promotions" element={<StoreProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </SessionProvider>
    </QueryClientProvider>
  );
}
