import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-paspa";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Sprout, 
  LayoutDashboard, 
  LogOut, 
  UserPlus, 
  ShoppingBag,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = profile?.role === "admin";
  const isAmbassador = profile?.role === "ambassador";
  
  const navLinks = [
    { href: "/products", label: "Guides PDF", icon: ShoppingBag },
    { href: "/about", label: "À Propos", icon: Globe },
    { href: "/contact", label: "Contact", icon: Mail },
    ...(isAmbassador ? [{ href: "/ambassador/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
    ...(!user ? [{ href: "/ambassador/signup", label: "Devenir Ambassadeur", icon: UserPlus }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-paspa shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-display tracking-tight text-primary leading-none">PASPA</span>
              <span className="text-sm font-semibold text-secondary tracking-widest leading-none">TECH</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <Button 
                variant="ghost" 
                onClick={() => logout()}
                className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            ) : (
              <Link href="/api/login">
                <Button className="bg-gradient-paspa shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Connexion
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-border/50 my-2" />
              
              {user ? (
                <Button 
                  variant="ghost" 
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </Button>
              ) : (
                <Link href="/api/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-paspa">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
