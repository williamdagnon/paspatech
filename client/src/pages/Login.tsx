import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sprout, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-secondary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12 max-w-lg"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-6">
            PASPA TECH
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Rejoignez la plateforme qui transforme l'agriculture africaine. 
            Accédez à des guides experts et devenez ambassadeur pour générer des revenus.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>RGPD</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-primary">PASPA TECH</span>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Connexion / Inscription</h2>
            <p className="text-muted-foreground">
              Connectez-vous à votre compte ou créez-en un nouveau en quelques secondes.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              size="lg"
              className="w-full h-14 text-lg bg-primary gap-3"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-google"
            >
              <LogIn className="w-5 h-5" />
              Se connecter avec Google
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg gap-3"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-email"
            >
              <UserPlus className="w-5 h-5" />
              Créer un compte / Email
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Vous n'avez pas encore de compte ? L'inscription est automatique lors de votre première connexion.
            </p>
            <Button 
              variant="ghost"
              className="text-primary"
              onClick={() => setLocation("/ambassador/signup")}
              data-testid="link-become-ambassador"
            >
              Devenir Ambassadeur et gagner 70% de commission
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            En vous connectant, vous acceptez nos{" "}
            <a href="/cgv" className="underline hover:text-primary">CGV</a>{" "}
            et notre{" "}
            <a href="/privacy" className="underline hover:text-primary">Politique de Confidentialité</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
