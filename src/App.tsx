
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
import WelcomePage from "./pages/WelcomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RequireAuth from "./components/auth/RequireAuth";
import { useEffect } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { StatisticsProvider } from "./contexts/StatisticsContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { trackPageView } from "./utils/analytics";

// Define routes configuration with redirects
const routes = [
  // Public routes
  { path: "/login", element: <LoginPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  
  // Protected routes
  { path: "/", element: <RequireAuth><Index /></RequireAuth> },
  { path: "/dashboard", element: <RequireAuth><Index /></RequireAuth> },
  { path: "/contatos", element: <RequireAuth><Contatos /></RequireAuth> },
  { path: "/disparos", element: <RequireAuth><TelegramPage /></RequireAuth> },
  { path: "/welcome", element: <RequireAuth><WelcomePage /></RequireAuth> },
  { path: "/boas-vindas", element: <RequireAuth><WelcomePage /></RequireAuth> },
  { path: "/mensagens", element: <RequireAuth><DisparoPage /></RequireAuth> },
  { path: "/financeiro", element: <RequireAuth><FinancePage /></RequireAuth> },
  { path: "/estatisticas", element: <RequireAuth><StatisticsProvider><StatsPage /></StatisticsProvider></RequireAuth> },
  { path: "/relatorios", element: <RequireAuth><StatisticsProvider><StatsPage /></StatisticsProvider></RequireAuth> },
  
  // Legacy routes (keeping old paths for backward compatibility)
  { path: "/parcelles", element: <RequireAuth><ParcelsPage /></RequireAuth> },
  { path: "/parcelles/:id", element: <RequireAuth><ParcelsDetailsPage /></RequireAuth> },
  { path: "/cultures", element: <RequireAuth><CropsPage /></RequireAuth> },
  { path: "/inventaire", element: <RequireAuth><InventoryPage /></RequireAuth> },
  { path: "/finances", element: <RequireAuth><FinancePage /></RequireAuth> },
  { path: "/statistiques", element: <RequireAuth><StatisticsProvider><StatsPage /></StatisticsProvider></RequireAuth> },
  { path: "/disparo", element: <RequireAuth><DisparoPage /></RequireAuth> },
  { path: "/telegram", element: <RequireAuth><TelegramPage /></RequireAuth> },
  
  // Redirects
  { path: "/rapports", element: <Navigate to="/relatorios" replace /> },
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
            </TooltipProvider>
          </BrowserRouter>
        </CRMProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
