import { useAmbassadorStats, useProfile } from "@/hooks/use-paspa";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Users, AlertCircle, Copy, Globe, ShieldCheck, Lock, MapPin, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Redirect, Link } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function AmbassadorDashboard() {
  const { data: stats, isLoading } = useAmbassadorStats();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();

  if (isLoading || profileLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!profile) return <Redirect to="/ambassador/signup" />;
  if (profile.role !== "ambassador") return <Redirect to="/" />;

  if (!profile.isApproved) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full">
          <Card className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold font-display" data-testid="text-pending-title">Compte en Attente d'Approbation</h2>
            <p className="text-muted-foreground">
              Votre candidature d'ambassadeur est en cours de révision par l'administration PASPA TECH.
              Vous recevrez un accès complet une fois votre compte approuvé.
            </p>
            <Alert className="text-left bg-orange-50 dark:bg-orange-950/20 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertTitle>En cours de vérification</AlertTitle>
              <AlertDescription>
                L'équipe PASPA TECH vérifie votre identité et vos informations.
                Ce processus prend généralement 24 à 48 heures.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Zone</p>
                  <p className="font-bold">{profile.zone === "zone1" ? "Afrique Subsaharienne" : "Afrique du Nord"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Pays</p>
                  <p className="font-bold">{profile.country || "N/A"}</p>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline" className="w-full" data-testid="button-home">Retour à l'accueil</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/products?ref=${user?.id}`;
  const referralCountries = stats?.referralCountries || {};

  function copyLink() {
    navigator.clipboard.writeText(shareLink);
    toast({ title: "Lien copié", description: "Le lien de parrainage a été copié." });
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-dashboard-title">Tableau de Bord Ambassadeur</h1>
            <p className="text-muted-foreground">Bienvenue, {user?.firstName || "Ambassadeur"} !</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <ShieldCheck className="w-3 h-3 mr-1" /> Compte Approuvé
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Ventes Totales", value: stats?.totalSales || 0, icon: ShoppingBag, color: "text-primary" },
          { label: "Filleuls", value: stats?.referralCount || 0, icon: Users, color: "text-blue-600" },
          { label: "Commissions (70%)", value: `${(stats?.totalCommission || 0).toLocaleString()} F`, icon: DollarSign, color: "text-secondary" },
          { label: "Quota Restant", value: `${stats?.zoneQuota || 0}`, icon: TrendingUp, color: "text-green-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-xl font-bold" data-testid={`text-stat-${i}`}>{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Détail des Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Gagné</p>
                <p className="text-xl font-bold text-primary" data-testid="text-total-commission">
                  {(stats?.totalCommission || 0).toLocaleString()} FCFA
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Payé</p>
                <p className="text-xl font-bold text-green-600">
                  {(stats?.paidCommission || 0).toLocaleString()} FCFA
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">En attente</p>
                <p className="text-xl font-bold text-orange-500">
                  {(stats?.pendingCommission || 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Quota de zone ({profile.zone === "zone1" ? "Subsaharienne" : "Afrique du Nord"})</h4>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(((50000 - (stats?.zoneQuota || 0)) / 50000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {stats?.zoneQuota || 0} guides restants sur 50 000
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Pays des Filleuls
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(referralCountries).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun filleul pour le moment</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(referralCountries).map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{country}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Lien de Parrainage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Partagez ce lien pour gagner 350 FCFA par vente.
              </p>
              <div className="flex gap-2">
                <div className="p-3 bg-muted rounded-lg text-xs truncate flex-1 font-mono select-all" data-testid="text-share-link">
                  {shareLink}
                </div>
                <Button size="icon" variant="outline" onClick={copyLink} data-testid="button-copy-link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2">Objectif : 1 001 000 FCFA de gain net</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Continuez à partager votre lien et investissez vos gains dans les projets agricoles PASPA TECH.
          </p>
          <div className="w-full max-w-md mx-auto bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
              style={{ width: `${Math.min(((stats?.totalCommission || 0) / 1001000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm mt-2 font-medium">
            {(stats?.totalCommission || 0).toLocaleString()} / 1 001 000 FCFA
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ShoppingBag(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  );
}
