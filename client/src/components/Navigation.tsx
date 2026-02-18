import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-paspa";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Sprout,
  LayoutDashboard,
  LogOut,
  UserPlus,
  ShoppingBag,
  ShieldCheck,
  Globe,
  Mail,
  ShoppingCart,
  User,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const { totalItems } = useCart();
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
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary transition-transform group-hover:scale-105">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold font-display tracking-tight text-primary leading-none">PASPA</span>
              <span className="text-xs font-semibold text-secondary tracking-widest leading-none">TECH</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 flex-wrap">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary font-bold" : "text-muted-foreground"
                }`}
                data-testid={`nav-link-${link.href.replace(/\//g, "-").slice(1)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" data-testid="badge-cart-count">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href={isAmbassador ? "/ambassador/dashboard" : isAdmin ? "/admin" : "/products"}>
                    <Button variant="ghost" size="icon" data-testid="button-user-profile">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button className="bg-primary" data-testid="button-nav-login">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>

            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-mobile-menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background"
          >
            <div className="flex flex-col p-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-md ${
                    location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}

              <Link href="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-md text-muted-foreground">
                <ShoppingCart className="h-5 w-5" />
                Panier
                {totalItems > 0 && <Badge className="ml-auto">{totalItems}</Badge>}
              </Link>

              <div className="h-px bg-border/50 my-1" />

              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full justify-start gap-3 text-destructive"
                  data-testid="button-mobile-logout"
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary" data-testid="button-mobile-login">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full" data-testid="button-mobile-register">
                      Inscription
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
