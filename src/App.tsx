import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BranchProvider } from "@/contexts/BranchContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import BranchUnavailable from "./pages/BranchUnavailable";
import { useBranch } from "./contexts/BranchContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isLoading, isError, errorMessage } = useBranch();

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero px-4 py-10">
        <div className="mx-auto max-w-5xl text-sm text-muted-foreground">
          Loading storefront...
        </div>
      </div>
    );
  }

  if (isError) {
    return <BranchUnavailable message={errorMessage} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BranchProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </BranchProvider>
  </QueryClientProvider>
);

export default App;
