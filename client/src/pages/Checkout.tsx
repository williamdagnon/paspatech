import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ShoppingBag, Smartphone,
  CheckCircle2, Shield, Loader2, AlertTriangle, CreditCard, Globe
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
  countries: string[];
  countriesLabel: string;
  requiresPhone: boolean;
  network?: string;
  provider?: string;
};

type Aggregator = {
  id: string;
  name: string;
  logo: string;
  description: string;
  currencies: string[];
  methods: PaymentMethod[];
};

type CountryInfo = {
  name: string;
  code: string;
  currency: string;
  phonePrefix: string;
};

type Step = "aggregator" | "method" | "details" | "confirm" | "processing" | "result";

export default function Checkout() {
  const { items, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>("aggregator");
  const [selectedAggregator, setSelectedAggregator] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const { data: paymentConfig } = useQuery({
    queryKey: ["/api/payment/aggregators"],
    queryFn: async () => {
      const res = await fetch("/api/payment/aggregators");
      if (!res.ok) throw new Error("Failed to load payment config");
      return res.json();
    },
  });

  // Query pour récupérer les méthodes de paiement disponibles pour le pays sélectionné
  const { data: countryMethods, refetch: refetchMethods } = useQuery({
    queryKey: ["/api/payment/methods", selectedCountry],
    queryFn: async () => {
      if (!selectedCountry) return null;
      const res = await fetch(`/api/payment/methods/${selectedCountry}`);
      if (!res.ok) throw new Error("Failed to load payment methods");
      return res.json();
    },
    enabled: !!selectedCountry,
  });

  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.firstName && user.lastName) setFullName(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

  // Réinitialiser la méthode sélectionnée quand le pays change
  useEffect(() => {
    if (selectedCountry && selectedMethod) {
      const isMethodAvailable = countryMethods?.methods?.some((m: any) => m.id === selectedMethod);
      if (!isMethodAvailable) {
        setSelectedMethod("");
      }
    }
  }, [selectedCountry, countryMethods, selectedMethod]);

  const aggregators: Record<string, Aggregator> = paymentConfig?.aggregators || {};
  const countries: Record<string, CountryInfo> = paymentConfig?.countries || {};
  const demoMode = paymentConfig?.demoMode || {};

  const currentAggregator = aggregators[selectedAggregator];
  const currentMethod = countryMethods?.methods?.find((m: any) => m.id === selectedMethod);
  const currentCountry = countries[selectedCountry];

  // Utiliser les méthodes dynamiques du pays sélectionné
  const availableMethods = countryMethods?.methods || [];
  const availableCountries = Object.values(countries);

  if (items.length === 0 && step !== "result") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-4">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-8">
            Ajoutez des guides PDF avant de procéder au paiement.
          </p>
          <Link href="/products">
            <Button className="bg-primary" data-testid="button-browse-products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Voir les Guides PDF
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  async function handlePayment() {
    if (!selectedAggregator || !selectedMethod || !phoneNumber || !email || !fullName || !selectedCountry) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }

    setStep("processing");

    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          aggregator: selectedAggregator,
          methodId: selectedMethod,
          phoneNumber: `${currentCountry?.phonePrefix || ""}${phoneNumber.replace(/^0+/, "")}`,
          email,
          fullName,
          countryCode: selectedCountry,
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: Number(item.product.price),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Échec du paiement");
      }

      setPaymentResult(data);
      clearCart();
      setStep("result");
    } catch (err: any) {
      toast({ title: "Erreur de paiement", description: err.message, variant: "destructive" });
      setStep("confirm");
    }
  }

  const stepTitles: Record<Step, string> = {
    aggregator: "Choisir un agrégateur",
    method: "Mode de paiement",
    details: "Vos informations",
    confirm: "Confirmer le paiement",
    processing: "Traitement en cours",
    result: "Résultat",
  };

  const stepNumbers: Record<Step, number> = {
    aggregator: 1,
    method: 2,
    details: 3,
    confirm: 4,
    processing: 5,
    result: 5,
  };

  return (
    <div className="py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 flex-wrap mb-6">
            {step !== "processing" && step !== "result" && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (step === "aggregator") setLocation("/cart");
                  else if (step === "method") setStep("aggregator");
                  else if (step === "details") setStep("method");
                  else if (step === "confirm") setStep("details");
                }}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
            )}
            <h1 className="text-2xl font-bold font-display text-primary">
              Paiement Sécurisé
            </h1>
          </div>

          {step !== "result" && step !== "processing" && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {["aggregator", "method", "details", "confirm"].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      stepNumbers[step] >= i + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    data-testid={`step-indicator-${s}`}
                  >
                    {stepNumbers[step] > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs whitespace-nowrap ${stepNumbers[step] >= i + 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {stepTitles[s as Step]}
                  </span>
                  {i < 3 && <div className={`w-8 h-0.5 ${stepNumbers[step] > i + 1 ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === "aggregator" && (
                  <motion.div key="agg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold mb-4">Choisissez votre agrégateur de paiement</h2>
                    <p className="text-muted-foreground mb-6">
                      Sélectionnez la plateforme de paiement qui correspond à votre pays et opérateur.
                    </p>
                    <div className="grid gap-4">
                      {Object.values(aggregators).map((agg: Aggregator) => (
                        <Card
                          key={agg.id}
                          className={`p-6 cursor-pointer transition-all hover-elevate ${
                            selectedAggregator === agg.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            setSelectedAggregator(agg.id);
                            setSelectedMethod("");
                            setSelectedCountry("");
                          }}
                          data-testid={`card-aggregator-${agg.id}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <img
                                src={agg.logo}
                                alt={`${agg.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = '<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-bold">{agg.name}</h3>
                                {demoMode[agg.id] && (
                                  <Badge variant="outline">Mode Démo</Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm mt-1">{agg.description}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {agg.methods.slice(0, 4).map((m: PaymentMethod) => (
                                  <Badge key={m.id} variant="secondary" className="text-xs">
                                    {m.name}
                                  </Badge>
                                ))}
                                {agg.methods.length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{agg.methods.length - 4} autres
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedAggregator === agg.id ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}>
                              {selectedAggregator === agg.id && (
                                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setStep("method")}
                        disabled={!selectedAggregator}
                        data-testid="button-next-method"
                      >
                        Continuer <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "method" && currentAggregator && (
                  <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold mb-2">
                      {currentAggregator.name} - Choisir votre pays et mode de paiement
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Sélectionnez d'abord votre pays, puis votre opérateur mobile money.
                    </p>

                    {/* Sélection du pays */}
                    <Card className="p-6 mb-6">
                      <div className="space-y-3">
                        <Label htmlFor="country-select">Pays de résidence</Label>
                        <Select
                          value={selectedCountry}
                          onValueChange={(value) => {
                            setSelectedCountry(value);
                            setSelectedMethod(""); // Reset method when country changes
                          }}
                        >
                          <SelectTrigger data-testid="select-country-method" className="mt-1.5">
                            <SelectValue placeholder="Sélectionnez votre pays" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCountries.map((c: CountryInfo) => (
                              <SelectItem key={c.code} value={c.code}>
                                <span className="flex items-center gap-2">
                                  <span>{(c as any).flag || '🏳️'}</span>
                                  {c.name} ({c.phonePrefix})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>

                    {/* Méthodes de paiement disponibles pour le pays sélectionné */}
                    {selectedCountry && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Modes de paiement disponibles</h3>
                        {countryMethods ? (
                          <div className="grid gap-3">
                            {availableMethods.map((method: any) => (
                              <Card
                                key={method.id}
                                className={`p-4 cursor-pointer transition-all hover-elevate ${
                                  selectedMethod === method.id ? "ring-2 ring-primary" : ""
                                }`}
                                onClick={() => setSelectedMethod(method.id)}
                                data-testid={`card-method-${method.id}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <Smartphone className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm">{method.name}</h3>
                                    <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                                      <Globe className="w-3 h-3" />
                                      {method.countries.map((code: string) => (countries[code] as any)?.flag || '🏳️').join(' ')} {method.countries.length === 1 ? countries[method.countries[0]]?.name : `${method.countries.length} pays`}
                                    </p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground"
                                  }`}>
                                    {selectedMethod === method.id && (
                                      <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Chargement des méthodes...</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setStep("details")}
                        disabled={!selectedMethod || !selectedCountry}
                        data-testid="button-next-details"
                      >
                        Continuer <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "details" && currentMethod && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold mb-2">Vos informations de paiement</h2>
                    <p className="text-muted-foreground mb-6">
                      Renseignez vos coordonnées pour le paiement via {currentMethod.name}.
                    </p>
                    <Card className="p-6">
                      <div className="space-y-5">
                        <div>
                          <Label htmlFor="country">Pays</Label>
                          <Select
                            value={selectedCountry}
                            onValueChange={setSelectedCountry}
                          >
                            <SelectTrigger data-testid="select-country" className="mt-1.5">
                              <SelectValue placeholder="Sélectionnez votre pays" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCountries.map((c: CountryInfo) => (
                                <SelectItem key={c.code} value={c.code}>
                                  <span className="flex items-center gap-2">
                                    <span>{(c as any).flag || '🏳️'}</span>
                                    {c.name} ({c.phonePrefix})
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="fullName">Nom complet</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Votre nom complet"
                            className="mt-1.5"
                            data-testid="input-fullname"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Adresse email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="mt-1.5"
                            data-testid="input-email"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Numéro de téléphone mobile money</Label>
                          <div className="flex gap-2 mt-1.5">
                            <div className="flex items-center bg-muted rounded-md px-3 text-sm font-medium min-w-[70px] justify-center">
                              {currentCountry?.phonePrefix || "---"}
                            </div>
                            <Input
                              id="phone"
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                              placeholder="07 XX XX XX XX"
                              className="flex-1"
                              data-testid="input-phone"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Le numéro associé à votre compte {currentMethod.name}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setStep("confirm")}
                        disabled={!selectedCountry || !phoneNumber || !email || !fullName}
                        data-testid="button-next-confirm"
                      >
                        Vérifier et confirmer <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "confirm" && (
                  <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold mb-4">Confirmer votre paiement</h2>

                    {demoMode[selectedAggregator] && (
                      <Card className="p-4 mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-sm">Mode Démonstration</p>
                            <p className="text-sm text-muted-foreground">
                              Le paiement sera simulé. Aucune transaction réelle ne sera effectuée.
                              Les clés API de production seront configurées ultérieurement.
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    <Card className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Agrégateur</span>
                          <span className="font-medium">{currentAggregator?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Mode de paiement</span>
                          <span className="font-medium">{currentMethod?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pays</span>
                          <span className="font-medium">{currentCountry?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Numéro</span>
                          <span className="font-medium">{currentCountry?.phonePrefix}{phoneNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium">{email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Nom</span>
                          <span className="font-medium">{fullName}</span>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <h4 className="font-bold text-sm mb-3">Articles commandés</h4>
                        {items.map((item) => (
                          <div key={item.product.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground truncate pr-2">
                              {item.product.name} x{item.quantity}
                            </span>
                            <span className="font-medium whitespace-nowrap">
                              {Number(item.product.price) * item.quantity} FCFA
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary" data-testid="text-checkout-total">{totalPrice} FCFA</span>
                        </div>
                      </div>
                    </Card>

                    <div className="mt-6 flex flex-col gap-3">
                      <Button
                        onClick={handlePayment}
                        className="w-full h-12 text-base"
                        data-testid="button-pay"
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        Payer {totalPrice} FCFA via {currentMethod?.name}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        <Shield className="w-3 h-3 inline mr-1" />
                        Paiement sécurisé via {currentAggregator?.name}. Vos données sont protégées.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === "processing" && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
                    <h2 className="text-xl font-bold mb-2">Traitement du paiement...</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                      {demoMode[selectedAggregator]
                        ? "Simulation du paiement en cours..."
                        : `Un prompt de paiement va être envoyé à votre téléphone via ${currentMethod?.name}. Veuillez confirmer sur votre appareil.`
                      }
                    </p>
                  </motion.div>
                )}

                {step === "result" && paymentResult && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="p-8 text-center space-y-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                        paymentResult.status === "demo" || paymentResult.status === "success"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-orange-100 dark:bg-orange-900/30"
                      }`}>
                        {paymentResult.status === "demo" || paymentResult.status === "success" ? (
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-10 h-10 text-orange-500" />
                        )}
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold font-display text-primary mb-2">
                          {paymentResult.status === "demo"
                            ? "Paiement Simulé avec Succès !"
                            : paymentResult.status === "success"
                            ? "Paiement Confirmé !"
                            : "Paiement en Attente"
                          }
                        </h2>
                        <p className="text-muted-foreground">
                          {paymentResult.message}
                        </p>
                      </div>

                      <Card className="p-4 text-left bg-muted/30">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Référence</span>
                            <span className="font-mono font-medium" data-testid="text-transaction-id">
                              {paymentResult.transactionId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Montant</span>
                            <span className="font-medium">{paymentResult.amount} {paymentResult.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Méthode</span>
                            <span className="font-medium">{paymentResult.method}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Agrégateur</span>
                            <span className="font-medium">{paymentResult.aggregator === "fedapay" ? "FedaPay" : paymentResult.aggregator}</span>
                          </div>
                        </div>
                      </Card>

                      {paymentResult.instructions && (
                        <Card className="p-4 text-left border-primary/20 bg-primary/5">
                          <p className="text-sm">
                            <Smartphone className="w-4 h-4 inline mr-2 text-primary" />
                            {paymentResult.instructions}
                          </p>
                        </Card>
                      )}

                      <div className="flex flex-col gap-3 pt-4">
                        <Link href="/products">
                          <Button className="w-full" data-testid="button-continue-shopping">
                            Continuer les achats
                          </Button>
                        </Link>
                        {isAuthenticated && (
                          <Link href="/dashboard">
                            <Button variant="outline" className="w-full" data-testid="button-dashboard">
                              Voir mes commandes
                            </Button>
                          </Link>
                        )}
                        <Link href="/">
                          <Button variant="ghost" className="w-full" data-testid="button-home">
                            Retour à l'accueil
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {step !== "processing" && step !== "result" && (
              <div>
                <Card className="p-5 space-y-4 sticky top-24">
                  <h3 className="font-bold text-base">Récapitulatif</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm gap-2">
                        <span className="text-muted-foreground truncate">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {Number(item.product.price) * item.quantity} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{totalPrice} FCFA</span>
                    </div>
                  </div>

                  {selectedAggregator && (
                    <div className="border-t pt-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CreditCard className="w-3 h-3" />
                        {currentAggregator?.name}
                      </div>
                      {selectedMethod && currentMethod && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Smartphone className="w-3 h-3" />
                          {currentMethod.name}
                        </div>
                      )}
                      {selectedCountry && currentCountry && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          {currentCountry.name}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3 text-green-600" />
                      Paiement 100% sécurisé
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      Téléchargement immédiat après paiement
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
