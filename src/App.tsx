import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Formations from "./pages/Formations";
import FormationDetail from "./pages/FormationDetail";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/admin/Dashboard";
import FormationManager from "./pages/admin/FormationManager";
import FormationEdit from "./pages/admin/FormationEdit";
import OrdersManager from "./pages/admin/OrdersManager";
import CourseViewer from "./pages/CourseViewer";
import MesFormations from "./pages/MesFormations";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/formations/:id" element={<FormationDetail />} />
            <Route path="/formations/:id/learn" element={<CourseViewer />} />
            <Route path="/mes-formations" element={<MesFormations />} />
            <Route path="/ia" element={<AIAssistant />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/connexion" element={<Auth />} />
            <Route path="/inscription" element={<Auth />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/formations" element={<FormationManager />} />
            <Route path="/admin/formations/:id" element={<FormationEdit />} />
            <Route path="/admin/orders" element={<OrdersManager />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
