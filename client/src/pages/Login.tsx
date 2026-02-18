import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Loader2, Sprout, LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export default function Login() {
  const { isAuthenticated, isLoading, login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    try {
      await login(data);
      toast({ title: "Connexion réussie", description: "Bienvenue sur PASPA TECH !" });
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  }

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
          <h1 className="text-4xl font-display font-bold text-white mb-6">PASPA TECH</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            La plateforme qui transforme l'agriculture africaine.
            Accédez à des guides experts et devenez ambassadeur.
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
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Connexion</h2>
            <p className="text-muted-foreground">
              Entrez vos identifiants pour accéder à votre compte.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} data-testid="input-login-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Votre mot de passe"
                          {...field}
                          data-testid="input-login-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary h-12 text-base" disabled={isLoggingIn} data-testid="button-submit-login">
                {isLoggingIn ? <Loader2 className="animate-spin" /> : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">Pas encore de compte ?</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/register">
              <Button variant="outline" className="w-full h-12" data-testid="link-register">
                Créer un compte acheteur
              </Button>
            </Link>
            <Link href="/ambassador/signup">
              <Button variant="ghost" className="w-full text-primary" data-testid="link-ambassador-signup">
                Devenir Ambassadeur (70% commission)
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            En vous connectant, vous acceptez nos{" "}
            <Link href="/cgv" className="underline hover:text-primary">CGV</Link>{" "}
            et notre{" "}
            <Link href="/privacy" className="underline hover:text-primary">Politique de Confidentialité</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
