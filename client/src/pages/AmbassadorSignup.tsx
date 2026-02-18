import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProfile } from "@/hooks/use-paspa";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const signupSchema = z.object({
  phoneNumber: z.string().min(8, "Numéro invalide"),
  country: z.string().min(2, "Pays requis"),
  zone: z.enum(["zone1", "zone2"]),
});

export default function AmbassadorSignup() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { mutate: createProfile, isPending } = useCreateProfile();
  const [, setLocation] = useLocation();

  // Redirect if already logged in but not signed up? 
  // We assume if they are here, they want to become an ambassador.

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      zone: "zone1",
    },
  });

  function onSubmit(data: z.infer<typeof signupSchema>) {
    // We are creating a profile. If user is not logged in, they should have logged in first.
    // However, Replit Auth flow is distinct.
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    createProfile({
      ...data,
      userId: user!.id,
      role: "ambassador",
      isApproved: false, // Default pending
    }, {
      onSuccess: () => {
        setLocation("/ambassador/dashboard");
      }
    });
  }

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold font-display mb-4">Rejoignez le réseau PASPA</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Pour devenir ambassadeur et gagner des commissions, vous devez d'abord vous connecter ou créer un compte.
        </p>
        <Button size="lg" className="bg-gradient-paspa" onClick={() => window.location.href = "/api/login"}>
          Se Connecter avec Replit / Google
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto bg-card p-8 md:p-12 rounded-2xl shadow-xl border border-border">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold font-display text-primary mb-2">Devenir Ambassadeur</h1>
            <p className="text-muted-foreground">
              Complétez votre profil pour commencer à vendre et gagner 70% de commission.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone (Mobile Money)</FormLabel>
                    <FormControl>
                      <Input placeholder="+221..." {...field} className="h-12 bg-muted/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays de résidence</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sénégal, Mali..." {...field} className="h-12 bg-muted/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre Zone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-muted/30">
                          <SelectValue placeholder="Selectionnez votre zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zone1">Zone 1 (Afrique Sub-Saharienne)</SelectItem>
                        <SelectItem value="zone2">Zone 2 (Reste du monde)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button type="submit" className="w-full bg-gradient-paspa h-12 text-lg" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : (
                    <>
                      Valider mon inscription <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
