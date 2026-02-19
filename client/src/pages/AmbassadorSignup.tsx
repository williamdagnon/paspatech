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
  acceptContract: z.boolean().refine(val => val === true, {
    message: "Vous devez lire et accepter le contrat d'ambassadeur"
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
      acceptContract: false,
    },
  });

  const [contractRead, setContractRead] = useState(false);

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
        acceptedContract: data.acceptContract,
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
                  <h3 className="font-bold text-lg">Contrat d'Ambassadeur PASPA TECH</h3>
                  <p className="text-sm text-muted-foreground">Veuillez lire attentivement le contrat ci-dessous avant de soumettre votre candidature.</p>
                  <div
                    className="border rounded-lg p-6 bg-muted/30 max-h-[400px] overflow-y-auto text-sm leading-relaxed space-y-4"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
                        setContractRead(true);
                      }
                    }}
                    data-testid="contract-text"
                  >
                    <h4 className="font-bold text-base text-center">CONTRAT D'AMBASSADEUR PASPA TECH</h4>
                    <p className="text-center text-muted-foreground">Accord de Partenariat Commercial</p>

                    <div className="space-y-3">
                      <h5 className="font-bold">Article 1 : Objet du Contrat</h5>
                      <p>Le présent contrat définit les conditions de collaboration entre PASPA TECH (ci-après « la Plateforme ») et l'Ambassadeur inscrit (ci-après « l'Ambassadeur »). L'Ambassadeur s'engage à promouvoir et vendre les guides PDF agricoles de la Plateforme dans sa zone géographique assignée, en échange d'une commission sur chaque vente réalisée.</p>

                      <h5 className="font-bold">Article 2 : Commission et Rémunération</h5>
                      <p>L'Ambassadeur percevra une commission de <strong>70% (350 FCFA)</strong> sur chaque guide PDF vendu au prix unitaire de 500 FCFA via son lien de parrainage. La Plateforme conserve 30% (150 FCFA) pour la maintenance, le développement et les frais opérationnels. Les commissions sont versées automatiquement via Mobile Money après confirmation du paiement par l'acheteur.</p>

                      <h5 className="font-bold">Article 3 : Zones Géographiques</h5>
                      <p><strong>Zone 1 (Afrique Subsaharienne) :</strong> Sénégal, Mali, Burkina Faso, Côte d'Ivoire, Guinée, Niger, Togo, Bénin, Cameroun, Congo, RDC, Gabon, Tchad, Ghana, Nigeria, Kenya, Tanzanie, Ouganda, Rwanda, Mozambique, Madagascar.</p>
                      <p><strong>Zone 2 (Afrique du Nord) :</strong> Maroc, Tunisie, Algérie, Égypte, Libye, Mauritanie.</p>
                      <p>Chaque zone dispose d'un quota maximal de <strong>50 000 guides</strong>. Les ventes et fonds de chaque zone sont strictement isolés.</p>

                      <h5 className="font-bold">Article 4 : Obligations de l'Ambassadeur</h5>
                      <p>L'Ambassadeur s'engage à :</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Promouvoir les guides PDF de manière éthique et professionnelle</li>
                        <li>Ne jamais revendre, reproduire, modifier ou redistribuer les contenus PDF</li>
                        <li>Respecter la politique de confidentialité et le RGPD</li>
                        <li>Fournir des informations exactes lors de l'inscription</li>
                        <li>Ne pas utiliser de méthodes frauduleuses pour générer des ventes</li>
                        <li>Informer immédiatement PASPA TECH de toute tentative de fraude détectée</li>
                      </ul>

                      <h5 className="font-bold">Article 5 : Propriété Intellectuelle</h5>
                      <p>Tous les guides PDF, marques, logos et contenus de la Plateforme sont la <strong>propriété exclusive de PASPA TECH</strong>. L'Ambassadeur n'acquiert aucun droit de propriété intellectuelle sur ces contenus. Toute reproduction non autorisée constitue une violation du droit d'auteur et entraînera la résiliation immédiate du contrat et des poursuites judiciaires.</p>

                      <h5 className="font-bold">Article 6 : Approbation et Résiliation</h5>
                      <p>L'inscription de l'Ambassadeur est soumise à l'approbation de l'administration PASPA TECH. La Plateforme se réserve le droit de refuser, suspendre ou révoquer le statut d'Ambassadeur à tout moment en cas de non-respect des obligations contractuelles, de fraude avérée ou suspectée, ou de comportement nuisant à la réputation de la Plateforme.</p>

                      <h5 className="font-bold">Article 7 : Protection des Données (RGPD)</h5>
                      <p>Conformément au Règlement Général sur la Protection des Données, l'Ambassadeur consent à la collecte et au traitement de ses données personnelles nécessaires au fonctionnement du partenariat. Les données sont stockées de manière sécurisée et ne seront jamais vendues à des tiers.</p>

                      <h5 className="font-bold">Article 8 : Clause Anti-Fraude</h5>
                      <p>Toute tentative de manipulation du système de parrainage (auto-achats, faux comptes, liens trompeurs, spam) sera détectée et sanctionnée par la suspension immédiate du compte, le gel des commissions non versées, et d'éventuelles poursuites judiciaires.</p>

                      <p className="text-center text-muted-foreground mt-6">
                        En acceptant ce contrat, vous reconnaissez avoir lu, compris et accepté l'ensemble des conditions ci-dessus.
                      </p>
                    </div>
                  </div>

                  {!contractRead && (
                    <p className="text-sm text-orange-500 font-medium">
                      Veuillez faire défiler le contrat jusqu'en bas pour pouvoir l'accepter.
                    </p>
                  )}

                  <FormField control={form.control} name="acceptContract" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-primary/5">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!contractRead}
                          data-testid="checkbox-contract"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className={!contractRead ? "text-muted-foreground" : ""}>
                          J'ai lu et j'accepte le Contrat d'Ambassadeur PASPA TECH dans son intégralité.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />

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
