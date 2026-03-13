import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Estoque from "@/pages/Estoque";
import VehicleDetail from "@/pages/VehicleDetail";
import Negociacoes from "@/pages/Negociacoes";
import Clientes from "@/pages/Clientes";
import ClienteDetail from "@/pages/ClienteDetail";
import Vistorias from "@/pages/Vistorias";
import Servicos from "@/pages/Servicos";
import Financeiro from "@/pages/Financeiro";
import Comissoes from "@/pages/Comissoes";
import Configuracoes from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            
            {/* Protected app routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/estoque" element={
              <ProtectedRoute>
                <AppLayout><Estoque /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/estoque/:id" element={
              <ProtectedRoute>
                <AppLayout><VehicleDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/negociacoes" element={
              <ProtectedRoute>
                <AppLayout><Negociacoes /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <AppLayout><Clientes /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clientes/:id" element={
              <ProtectedRoute>
                <AppLayout><ClienteDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/vistorias" element={
              <ProtectedRoute>
                <AppLayout><Vistorias /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/servicos" element={
              <ProtectedRoute>
                <AppLayout><Servicos /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute>
                <AppLayout><Financeiro /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/comissoes" element={
              <ProtectedRoute>
                <AppLayout><Comissoes /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <AppLayout><Configuracoes /></AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
