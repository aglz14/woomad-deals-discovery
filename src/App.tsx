
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import About from "./pages/About";
import Contacto from "./pages/Contacto";
import Nosotros from "./pages/Nosotros";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import MallDetails from "./pages/MallDetails";
import PublicMallProfile from "./pages/PublicMallProfile";
import PublicStoreProfile from "./pages/PublicStoreProfile";
import MallManagement from "./pages/MallManagement";
import AdminMallProfile from "./pages/AdminMallProfile";
import StoreProfile from "./pages/StoreProfile";
import Promotions from "./pages/Promotions";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<ResetPassword />} />
        <Route path="/mall/:mallId" element={<MallDetails />} />
        <Route path="/mall/:mallId/public" element={<PublicMallProfile />} />
        <Route path="/store/:storeId/public" element={<PublicStoreProfile />} />
        <Route path="/mall-management" element={<MallManagement />} />
        <Route path="/mall/:mallId/admin" element={<AdminMallProfile />} />
        <Route path="/store/:storeId" element={<StoreProfile />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </Router>
  );
}

export default App;
