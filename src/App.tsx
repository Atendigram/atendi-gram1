
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ParcelsPage from "./pages/ParcelsPage";
import ParcelsDetailsPage from "./pages/ParcelsDetailsPage";
import CropsPage from "./pages/CropsPage";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import StatsPage from "./pages/StatsPage";
import DisparoPage from "./pages/DisparoPage";
import TelegramPage from "./pages/TelegramPage";
import Contatos from "./pages/Contatos";
import SuportePage from "./pages/SuportePage";
import ConectarPerfilPage from "./pages/ConectarPerfilPage";
import WelcomePage from "./pages/WelcomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useEffect } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { StatisticsProvider } from "./contexts/StatisticsContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { trackPageView } from "./utils/analytics";
import { Toaster } from "@/components/ui/toaster";

// Define routes configuration with redirects
const routes = [
  // Public routes
  { path: "/login", element: <LoginPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  
  // Protected routes
  { path: "/", element: <ProtectedRoute><Index /></ProtectedRoute> },
  { path: "/dashboard", element: <ProtectedRoute><Index /></ProtectedRoute> },
  { path: "/contatos", element: <ProtectedRoute><Contatos /></ProtectedRoute> },
  { path: "/disparos", element: <ProtectedRoute><TelegramPage /></ProtectedRoute> },
  { path: "/boas-vindas", element: <ProtectedRoute><WelcomePage /></ProtectedRoute> },
  { path: "/suporte", element: <ProtectedRoute><SuportePage /></ProtectedRoute> },
  { path: "/conectar-perfil", element: <ProtectedRoute><ConectarPerfilPage /></ProtectedRoute> },
  
  
  
  
  
  // Legacy routes (keeping old paths for backward compatibility)
  { path: "/parcelles", element: <ProtectedRoute><ParcelsPage /></ProtectedRoute> },
  { path: "/parcelles/:id", element: <ProtectedRoute><ParcelsDetailsPage /></ProtectedRoute> },
  { path: "/cultures", element: <ProtectedRoute><CropsPage /></ProtectedRoute> },
  { path: "/inventaire", element: <ProtectedRoute><InventoryPage /></ProtectedRoute> },
  { path: "/finances", element: <ProtectedRoute><FinancePage /></ProtectedRoute> },
  { path: "/statistiques", element: <ProtectedRoute><StatisticsProvider><StatsPage /></StatisticsProvider></ProtectedRoute> },
  { path: "/disparo", element: <ProtectedRoute><DisparoPage /></ProtectedRoute> },
  { path: "/telegram", element: <ProtectedRoute><TelegramPage /></ProtectedRoute> },
  
  // Redirects
  { path: "/rapports", element: <Navigate to="/dashboard" replace /> },
  { path: "/parametres", element: <Navigate to="/dashboard" replace /> },
  { path: "/configuracoes", element: <Navigate to="/dashboard" replace /> },
  
  // 404
  { path: "*", element: <NotFound /> }
];

// Create query client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Router change handler component
const RouterChangeHandler = () => {
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Track page view for analytics
    const currentPath = window.location.pathname;
    const pageName = currentPath === '/' ? 'dashboard' : currentPath.replace(/^\//, '');
    trackPageView(pageName);
  }, [location.pathname]);
  
  return null;
};

// Application main component with properly nested providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppSettingsProvider>
          <CRMProvider>
            <BrowserRouter>
              <TooltipProvider>
                <RouterChangeHandler />
                <Routes>
                  {routes.map((route) => (
                    <Route 
                      key={route.path} 
                      path={route.path} 
                      element={route.element} 
                    />
                  ))}
                </Routes>
                <Toaster />
              </TooltipProvider>
            </BrowserRouter>
          </CRMProvider>
        </AppSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
