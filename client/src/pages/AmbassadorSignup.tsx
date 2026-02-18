import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProfile } from "@/hooks/use-paspa";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Loader2, ArrowRight, Users, Globe, Wallet, ShieldCheck, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const ZONE1_COUNTRIES = [
  "Sénégal", "Mali", "Burkina Faso", "Côte d'Ivoire", "Guinée",
  "Niger", "Togo", "Bénin", "Cameroun", "Congo", "RDC",
  "Gabon", "Tchad", "Ghana", "Nigeria", "Kenya", "Tanzanie",
  "Ouganda", "Rwanda", "Mozambique", "Madagascar"
];

const ZONE2_COUNTRIES = [
  "Maroc", "Tunisie", "Algérie", "Égypte", "Libye", "Mauritanie"
];

const signupSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis (minimum 2 caractères)"),
  lastName: z.string().min(2, "Le nom est requis (minimum 2 caractères)"),
  phoneNumber: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  country: z.string().min(1, "Veuillez sélectionner votre pays"),
  zone: z.enum(["zone1", "zone2"]),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions pour devenir ambassadeur"
  }),
  acceptNoResale: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter la clause de non-revente"
  }),
});

export default function AmbassadorSignup() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { mutate: createProfile, isPending } = useCreateProfile();
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: "",
      country: "",
      zone: "zone1",
      acceptTerms: false,
      acceptNoResale: false,
    },
  });

  const selectedZone = form.watch("zone");
  const countries = selectedZone === "zone1" ? ZONE1_COUNTRIES : ZONE2_COUNTRIES;

  function onSubmit(data: z.infer<typeof signupSchema>) {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    createProfile({
      userId: user!.id,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "ambassador",
      zone: data.zone,
      phoneNumber: data.phoneNumber,
      country: data.country,
      isApproved: false,
      acceptedTerms: data.acceptTerms,
      acceptedNoResale: data.acceptNoResale,
    }, {
      onSuccess: () => {
        setSuccess(true);
      }
    });
  }

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-4">Rejoignez le réseau PASPA</h1>
          <p className="text-muted-foreground mb-8">
            Pour devenir ambassadeur et gagner 70% de commission sur chaque vente,
            vous devez d'abord vous connecter ou créer un compte.
          </p>
          <Button size="lg" className="bg-primary h-14 px-8 text-lg" onClick={() => window.location.href = "/api/login"} data-testid="button-login-ambassador">
            Se Connecter / Créer un Compte
          </Button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Card className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold font-display text-primary">Inscription Réussie !</h2>
            <p className="text-muted-foreground">
              Votre demande d'ambassadeur a été envoyée avec succès. 
              Notre équipe va examiner votre candidature et vous serez notifié une fois approuvé.
              Vous pouvez vous connecter à tout moment avec votre compte Google/Replit.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button className="w-full bg-primary" onClick={() => setLocation("/ambassador/dashboard")} data-testid="button-go-dashboard">
                Accéder à mon Tableau de Bord
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/")} data-testid="button-go-home">
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-muted/20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-display text-primary mb-4">Devenir Ambassadeur PASPA TECH</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Rejoignez notre réseau d'ambassadeurs et gagnez 70% de commission
              sur chaque guide vendu via votre lien de recommandation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">70% Commission</h3>
              <p className="text-sm text-muted-foreground">350 FCFA par PDF vendu directement sur votre Mobile Money.</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold mb-2">Couverture Africaine</h3>
              <p className="text-sm text-muted-foreground">2 zones couvrant tout le continent africain.</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Paiement Automatique</h3>
              <p className="text-sm text-muted-foreground">Commissions versées automatiquement, sans délai.</p>
            </Card>
          </div>

          <Card className="p-8 md:p-12">
            <h2 className="text-2xl font-bold font-display text-center mb-8">Formulaire d'Inscription</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre prénom" {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de famille</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone (Mobile Money)</FormLabel>
                      <FormControl>
                        <Input placeholder="+221 77 123 45 67" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormDescription>Ce numéro sera utilisé pour recevoir vos commissions via Mobile Money.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Votre Zone Géographique</FormLabel>
                      <Select onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("country", "");
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-zone">
                            <SelectValue placeholder="Sélectionnez votre zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="zone1">Zone 1 - Afrique Subsaharienne</SelectItem>
                          <SelectItem value="zone2">Zone 2 - Afrique du Nord et autres</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedZone === "zone1"
                          ? "Zone 1 couvre l'Afrique subsaharienne (Sénégal, Mali, Côte d'Ivoire, etc.)"
                          : "Zone 2 couvre l'Afrique du Nord (Maroc, Tunisie, Algérie, etc.)"
                        }
                      </FormDescription>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="Sélectionnez votre pays" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-bold text-lg">Engagements contractuels</h3>

                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-terms"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            J'accepte les{" "}
                            <Link href="/cgv" className="text-primary underline">Conditions Générales de Vente</Link>{" "}
                            et la{" "}
                            <Link href="/privacy" className="text-primary underline">Politique de Confidentialité</Link>{" "}
                            de PASPA TECH.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptNoResale"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-no-resale"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Je m'engage à ne pas revendre, reproduire ou diffuser les guides PDF de PASPA TECH.
                            Les PDF sont la propriété exclusive de PASPA TECH.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full bg-primary h-14 text-lg" disabled={isPending} data-testid="button-submit-ambassador">
                    {isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        Valider mon inscription <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Votre candidature sera examinée par l'équipe PASPA TECH.
                  Vous pouvez vous reconnecter à tout moment via Google/Replit.
                </p>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
