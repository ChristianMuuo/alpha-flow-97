
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { HelmetProvider } from "react-helmet-async";
import MainLayout from "@/components/MainLayout";
import { Suspense, lazy } from "react";
import Loading from "@/components/ui/Loading";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const SignalsPage = lazy(() => import("./pages/SignalsPage"));
const EAsPage = lazy(() => import("./pages/EAsPage"));
const IndicatorsPage = lazy(() => import("./pages/IndicatorsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MarketsPage = lazy(() => import("./pages/MarketsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const ImmersiveReaderPage = lazy(() => import("./pages/ImmersiveReaderPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/markets" element={<MarketsPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/signals" element={<SignalsPage />} />
                  <Route path="/eas" element={<EAsPage />} />
                  <Route path="/indicators" element={<IndicatorsPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/library/read/:bookId" element={<ImmersiveReaderPage />} />
                  <Route path="/product/:productId" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;