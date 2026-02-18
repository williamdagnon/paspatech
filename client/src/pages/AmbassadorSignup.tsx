import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Loader2, ArrowRight, Users, Globe, Wallet, ShieldCheck, Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  phoneNumber: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  country: z.string().min(1, "Veuillez sélectionner votre pays"),
  zone: z.enum(["zone1", "zone2"]),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions"
  }),
  acceptNoResale: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter la clause de non-revente"
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function AmbassadorSignup() {
  const { registerAmbassador, isRegisteringAmbassador, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      country: "",
      zone: "zone1",
      acceptTerms: false,
      acceptNoResale: false,
    },
  });

  const selectedZone = form.watch("zone");
  const countries = selectedZone === "zone1" ? ZONE1_COUNTRIES : ZONE2_COUNTRIES;

  async function onSubmit(data: z.infer<typeof signupSchema>) {
    try {
      await registerAmbassador({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        country: data.country,
        zone: data.zone,
        acceptedTerms: data.acceptTerms,
        acceptedNoResale: data.acceptNoResale,
      });
      setSuccess(true);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  }

  if (authLoading) return null;

  if (isAuthenticated && !success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-4">Vous êtes déjà connecté</h1>
          <p className="text-muted-foreground mb-8">
            Vous avez déjà un compte. Accédez à votre tableau de bord ou retournez à l'accueil.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="bg-primary" onClick={() => setLocation("/ambassador/dashboard")} data-testid="button-go-dashboard">
              Tableau de Bord
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-go-home">
              Accueil
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full">
          <Card className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold font-display text-primary">Inscription Réussie !</h2>
            <p className="text-muted-foreground">
              Votre compte ambassadeur a été créé avec succès.
              Notre équipe va examiner votre candidature et vous serez notifié une fois approuvé.
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
            <h2 className="text-2xl font-bold font-display text-center mb-8">Formulaire d'Inscription Ambassadeur</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl><Input placeholder="Votre prénom" {...field} data-testid="input-first-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de famille</FormLabel>
                      <FormControl><Input placeholder="Votre nom" {...field} data-testid="input-last-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse email</FormLabel>
                    <FormControl><Input type="email" placeholder="votre@email.com" {...field} data-testid="input-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="Minimum 6 caractères" {...field} data-testid="input-password" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer</FormLabel>
                      <FormControl><Input type="password" placeholder="Confirmez" {...field} data-testid="input-confirm-password" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone (Mobile Money)</FormLabel>
                    <FormControl><Input placeholder="+221 77 123 45 67" {...field} data-testid="input-phone" /></FormControl>
                    <FormDescription>Ce numéro sera utilisé pour recevoir vos commissions via Mobile Money.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="zone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre Zone Géographique</FormLabel>
                    <Select onValueChange={(val) => { field.onChange(val); form.setValue("country", ""); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-zone"><SelectValue placeholder="Sélectionnez votre zone" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zone1">Zone 1 - Afrique Subsaharienne</SelectItem>
                        <SelectItem value="zone2">Zone 2 - Afrique du Nord et autres</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedZone === "zone1" ? "Sénégal, Mali, Côte d'Ivoire, Cameroun, etc." : "Maroc, Tunisie, Algérie, Égypte, etc."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays de résidence</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-country"><SelectValue placeholder="Sélectionnez votre pays" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-bold text-lg">Engagements contractuels</h3>
                  <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-terms" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          J'accepte les <Link href="/cgv" className="text-primary underline">CGV</Link> et la <Link href="/privacy" className="text-primary underline">Politique de Confidentialité</Link>.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="acceptNoResale" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-no-resale" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Je m'engage à ne pas revendre, reproduire ou diffuser les guides PDF. Propriété exclusive de PASPA TECH.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full bg-primary h-14 text-lg" disabled={isRegisteringAmbassador} data-testid="button-submit-ambassador">
                  {isRegisteringAmbassador ? <Loader2 className="animate-spin" /> : (
                    <>Valider mon inscription <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Déjà inscrit ? <Link href="/login" className="text-primary underline">Connectez-vous</Link>
                </p>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
