import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

import Landing from "@/pages/Landing";
import Products from "@/pages/Products";
import AmbassadorSignup from "@/pages/AmbassadorSignup";
import AmbassadorDashboard from "@/pages/AmbassadorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import CGV from "@/pages/CGV";
import MentionsLegales from "@/pages/MentionsLegales";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import UserDashboard from "@/pages/UserDashboard";
import ProductDetail from "@/pages/ProductDetail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/products" component={Products} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/ambassador/signup" component={AmbassadorSignup} />
      <Route path="/ambassador/dashboard" component={AmbassadorDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/cgv" component={CGV} />
      <Route path="/mentions-legales" component={MentionsLegales} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-background">
            <Navigation />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
