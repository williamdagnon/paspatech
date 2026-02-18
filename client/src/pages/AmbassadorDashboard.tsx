import { useAmbassadorStats, useProfile } from "@/hooks/use-paspa";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, TrendingUp, Users, AlertCircle, Copy } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Redirect } from "wouter";

export default function AmbassadorDashboard() {
  const { data: stats, isLoading } = useAmbassadorStats();
  const { data: profile } = useProfile();
  const { user } = useAuth();

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  
  if (!profile) return <Redirect to="/ambassador/signup" />;
  if (profile.role !== "ambassador") return <Redirect to="/" />;

  // Mock data for charts if API returns basic stats
  const chartData = [
    { name: "Lun", sales: 4000 },
    { name: "Mar", sales: 3000 },
    { name: "Mer", sales: 2000 },
    { name: "Jeu", sales: 2780 },
    { name: "Ven", sales: 1890 },
    { name: "Sam", sales: 2390 },
    { name: "Dim", sales: 3490 },
  ];

  const shareLink = `${window.location.origin}/products?ref=${user?.id}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.firstName || "Ambassadeur"} !</p>
        </div>
        
        {!profile.isApproved && (
          <Alert variant="destructive" className="max-w-md bg-orange-50 border-orange-200 text-orange-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Compte en attente</AlertTitle>
            <AlertDescription>
              Votre compte est en cours de validation par l'administrateur. Les paiements de commissions sont suspendus.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="shadow-md border-primary/10 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ventes</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.totalSales || 0} FCFA</div>
            <p className="text-xs text-muted-foreground mt-1">+20% ce mois</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-orange-100 bg-gradient-to-br from-white to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commissions (70%)</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{stats?.commissionEarned || 0} FCFA</div>
            <p className="text-xs text-muted-foreground mt-1">Solde disponible</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quota Zone {profile.zone}</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.zoneQuota || 0} / 50k</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(((stats?.zoneQuota || 0) / 50000) * 100, 100)}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Performance Hebdomadaire</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}F`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.6)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Lien de Parrainage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Partagez ce lien pour gagner des commissions sur chaque vente.
            </p>
            <div className="flex gap-2">
              <div className="p-3 bg-muted rounded-lg text-sm truncate flex-1 font-mono select-all">
                {shareLink}
              </div>
              <Button size="icon" variant="outline" onClick={() => navigator.clipboard.writeText(shareLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gradient-paspa p-6 rounded-2xl text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">Besoin d'aide ?</h3>
            <p className="text-white/80 text-sm mb-4">
              Contactez le support ambassadeur pour toute question sur vos paiements.
            </p>
            <Button variant="secondary" className="w-full text-primary font-bold">
              Contacter Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
