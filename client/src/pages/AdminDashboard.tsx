import { useAdminDashboard, useAdminAmbassadors, useApproveAmbassador, useProfile } from "@/hooks/use-paspa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Shield } from "lucide-react";
import { Redirect } from "wouter";

export default function AdminDashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: ambassadors, isLoading: ambassadorsLoading } = useAdminAmbassadors();
  const { mutate: approve, isPending: isApproving } = useApproveAmbassador();

  if (profileLoading || statsLoading || ambassadorsLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  }

  if (profile?.role !== "admin") return <Redirect to="/" />;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la plateforme PASPA TECH</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StatsCard title="Ventes Totales" value={`${stats?.totalSales} FCFA`} />
        <StatsCard title="Ambassadeurs" value={stats?.ambassadorsCount} />
        <StatsCard title="Ventes Zone 1" value={stats?.zone1Sales} />
        <StatsCard title="Ventes Zone 2" value={stats?.zone2Sales} />
      </div>

      {/* Ambassadors Management */}
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <CardTitle>Gestion des Ambassadeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ambassadors?.map((ambassador) => (
                <TableRow key={ambassador.id}>
                  <TableCell>{ambassador.email || "N/A"}</TableCell>
                  <TableCell>{ambassador.phoneNumber}</TableCell>
                  <TableCell>{ambassador.country}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-xs">
                      {ambassador.zone}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ambassador.isApproved ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                        Approuvé
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!ambassador.isApproved && (
                      <Button 
                        size="sm" 
                        onClick={() => approve(ambassador.id)}
                        disabled={isApproving}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Valider
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {ambassadors?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun ambassadeur inscrit pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value }: { title: string, value: string | number | undefined }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value || 0}</div>
      </CardContent>
    </Card>
  );
}
