
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/components/providers/SessionProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Promotions from "./pages/Promotions";
import MallManagement from "./pages/MallManagement";
import StoreProfile from "./pages/StoreProfile";
import { useState } from "react";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/mall/:mallId/manage" element={<MallManagement />} />
              <Route path="/store/:storeId" element={<StoreProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
