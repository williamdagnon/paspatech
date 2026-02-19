import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUserOrders } from "@/hooks/use-paspa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, User, ShoppingBag, Download, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Redirect, Link } from "wouter";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: orders, isLoading: ordersLoading } = useUserOrders();

  if (authLoading || profileLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!user) return <Redirect to="/login" />;

  const totalSpent = orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary/10 rounded-xl">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-dashboard-title">Mon Espace</h1>
            <p className="text-muted-foreground">Gérez votre profil et consultez vos achats</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Achats</CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-orders">{orders?.length || 0}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Dépensé</CardTitle>
                <Download className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary" data-testid="text-total-spent">{totalSpent} FCFA</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Guides Disponibles</CardTitle>
                <Download className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-downloads-available">
                  {orders?.filter((o: any) => o.status === "completed").length || 0}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Mon Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold" data-testid="text-user-name">
                    {user.firstName || ""} {user.lastName || ""}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {profile?.role === "ambassador" ? "Ambassadeur" : profile?.role === "admin" ? "Admin" : "Client"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground" data-testid="text-user-email">{user.email}</span>
                </div>
                {profile?.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.phoneNumber}</span>
                  </div>
                )}
                {profile?.country && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.country}</span>
                  </div>
                )}
                {profile?.zone && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {profile.zone === "zone1" ? "Zone 1 - Afrique Subsaharienne" : "Zone 2 - Afrique du Nord"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Membre depuis {new Date(user.createdAt || "").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg">Historique des Achats</CardTitle>
              <Link href="/products">
                <Button variant="outline" size="sm" data-testid="button-browse-more">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Acheter plus
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
              ) : orders?.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Aucun achat pour le moment</p>
                  <Link href="/products">
                    <Button className="bg-primary" data-testid="button-start-shopping">Découvrir les Guides</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guide</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium" data-testid={`text-order-product-${order.id}`}>
                            {order.productName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="font-medium">{order.amount} FCFA</TableCell>
                          <TableCell>
                            <Badge
                              className={order.status === "completed"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }
                            >
                              {order.status === "completed" ? "Complété" : "En cours"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.status === "completed" && (
                              <Button variant="outline" size="sm" data-testid={`button-download-${order.id}`}>
                                <Download className="w-3 h-3 mr-1" />
                                PDF
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
