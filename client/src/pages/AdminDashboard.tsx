import { useAdminDashboard, useAdminAmbassadors, useApproveAmbassador, useRejectAmbassador, useProfile, useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-paspa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Check, X, Shield, Users, ShoppingBag, TrendingUp, DollarSign, Calendar, Plus, Trash2, Globe, FileText, ArrowUpDown, Upload, Pencil, ImageIcon } from "lucide-react";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().min(10, "Description requise (min 10 caractères)"),
  price: z.string().min(1, "Prix requis"),
  coverImageUrl: z.string().optional(),
  fileUrl: z.string().min(1, "Le fichier PDF du guide est obligatoire"),
});

export default function AdminDashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: ambassadors } = useAdminAmbassadors();
  const { data: adminProducts } = useAdminProducts();
  const { mutate: approve, isPending: isApproving } = useApproveAmbassador();
  const { mutate: reject, isPending: isRejecting } = useRejectAmbassador();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [editCoverPreview, setEditCoverPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: "500", coverImageUrl: "", fileUrl: "" },
  });

  const editForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: "500", coverImageUrl: "", fileUrl: "" },
  });

  const [pdfFileName, setPdfFileName] = useState("");
  const [editPdfFileName, setEditPdfFileName] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const editPdfInputRef = useRef<HTMLInputElement>(null);

  if (profileLoading || statsLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }
  if (profile?.role !== "admin") return <Redirect to="/" />;

  const filteredAmbassadors = (ambassadors || [])
    .filter((a: any) => filterZone === "all" || a.zone === filterZone)
    .sort((a: any, b: any) => {
      if (sortBy === "sales") return (b.totalEarned || 0) - (a.totalEarned || 0);
      if (sortBy === "referrals") return (b.referralCount || 0) - (a.referralCount || 0);
      if (sortBy === "name") return (a.firstName || "").localeCompare(b.firstName || "");
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  async function uploadCoverImage(file: File): Promise<string | null> {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("cover", file);
      const res = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Erreur", description: err.message || "Erreur lors de l'envoi", variant: "destructive" });
        return null;
      }
      const { url } = await res.json();
      return url;
    } catch {
      toast({ title: "Erreur", description: "Erreur réseau lors de l'envoi du fichier", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, mode: "create" | "edit") {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (mode === "create") {
      setCoverPreview(preview);
    } else {
      setEditCoverPreview(preview);
    }
    const url = await uploadCoverImage(file);
    if (url) {
      if (mode === "create") {
        form.setValue("coverImageUrl", url);
      } else {
        editForm.setValue("coverImageUrl", url);
      }
    }
  }

  async function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>, mode: "create" | "edit") {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Erreur", description: err.message || "Erreur lors de l'envoi du PDF", variant: "destructive" });
        return;
      }
      const { url } = await res.json();
      if (mode === "create") {
        form.setValue("fileUrl", url);
        setPdfFileName(file.name);
      } else {
        editForm.setValue("fileUrl", url);
        setEditPdfFileName(file.name);
      }
      toast({ title: "PDF envoyé", description: `${file.name} a été uploadé avec succès.` });
    } catch {
      toast({ title: "Erreur", description: "Erreur réseau lors de l'envoi du PDF", variant: "destructive" });
    } finally {
      setIsUploadingPdf(false);
    }
  }

  function onCreateProduct(data: z.infer<typeof productSchema>) {
    createProduct({ ...data, fileUrl: data.fileUrl }, {
      onSuccess: () => {
        setProductDialogOpen(false);
        form.reset();
        setCoverPreview("");
        setPdfFileName("");
      },
    });
  }

  function openEditDialog(product: any) {
    setEditingProduct(product);
    editForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      coverImageUrl: product.coverImageUrl || "",
      fileUrl: product.fileUrl || "",
    });
    setEditCoverPreview(product.coverImageUrl || "");
    setEditPdfFileName(product.fileUrl ? product.fileUrl.split("/").pop() || "PDF existant" : "");
    setEditDialogOpen(true);
  }

  function onUpdateProduct(data: z.infer<typeof productSchema>) {
    if (!editingProduct) return;
    updateProduct({ id: editingProduct.id, data }, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setEditingProduct(null);
        setEditCoverPreview("");
        setEditPdfFileName("");
      },
    });
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl"><Shield className="w-8 h-8 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-admin-title">Administration PASPA TECH</h1>
          <p className="text-muted-foreground">Gestion complète de la plateforme</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Inscrits", value: stats?.totalUsers, icon: Users, color: "text-blue-600" },
          { label: "Commandes Totales", value: stats?.totalOrders, icon: ShoppingBag, color: "text-primary" },
          { label: "Aujourd'hui", value: stats?.todayOrders, icon: Calendar, color: "text-orange-500" },
          { label: "Revenus", value: `${(stats?.totalRevenue || 0).toLocaleString()} F`, icon: TrendingUp, color: "text-green-600" },
          { label: "Ambassadeurs", value: stats?.ambassadorsCount, icon: Globe, color: "text-purple-600" },
          { label: "En attente", value: stats?.pendingAmbassadors, icon: Shield, color: "text-yellow-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-xl font-bold">{s.value || 0}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium">Ventes Zone 1 (Subsaharienne)</span>
              <Badge variant="outline">Zone 1</Badge>
            </div>
            <div className="text-2xl font-bold text-primary" data-testid="text-zone1-sales">{stats?.zone1Sales || 0} / 50 000</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(((stats?.zone1Sales || 0) / 50000) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium">Ventes Zone 2 (Afrique du Nord)</span>
              <Badge variant="outline">Zone 2</Badge>
            </div>
            <div className="text-2xl font-bold text-secondary" data-testid="text-zone2-sales">{stats?.zone2Sales || 0} / 50 000</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-secondary h-2 rounded-full" style={{ width: `${Math.min(((stats?.zone2Sales || 0) / 50000) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Commissions Totales</p>
              <p className="text-xl font-bold">{(stats?.totalCommissions || 0).toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payées</p>
              <p className="text-xl font-bold text-green-600">{(stats?.paidCommissions || 0).toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">En attente</p>
              <p className="text-xl font-bold text-orange-500">{(stats?.pendingCommissions || 0).toLocaleString()} FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ambassadors" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="ambassadors" data-testid="tab-ambassadors">Ambassadeurs</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Produits PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="ambassadors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-lg">Gestion des Ambassadeurs ({filteredAmbassadors.length})</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="text-sm border rounded-md px-3 py-2 bg-background"
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  data-testid="select-filter-zone"
                >
                  <option value="all">Toutes les zones</option>
                  <option value="zone1">Zone 1</option>
                  <option value="zone2">Zone 2</option>
                </select>
                <select
                  className="text-sm border rounded-md px-3 py-2 bg-background"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  data-testid="select-sort"
                >
                  <option value="date">Date inscription</option>
                  <option value="sales">Ventes</option>
                  <option value="referrals">Filleuls</option>
                  <option value="name">Nom</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Filleuls</TableHead>
                      <TableHead>Gains</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAmbassadors.map((amb: any) => (
                      <TableRow key={amb.id}>
                        <TableCell className="font-medium" data-testid={`text-amb-name-${amb.id}`}>
                          {amb.firstName} {amb.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{amb.email || "N/A"}</TableCell>
                        <TableCell>{amb.country || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs uppercase">{amb.zone}</Badge>
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-amb-referrals-${amb.id}`}>
                          {amb.referralCount || 0}
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          {(amb.totalEarned || 0).toLocaleString()} F
                        </TableCell>
                        <TableCell>
                          {amb.isApproved ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Approuvé</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">En attente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!amb.isApproved ? (
                              <>
                                <Button size="sm" onClick={() => approve(amb.id)} disabled={isApproving} data-testid={`button-approve-${amb.id}`}>
                                  <Check className="w-3 h-3 mr-1" /> Valider
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => reject(amb.id)} disabled={isRejecting} data-testid={`button-reject-${amb.id}`}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => reject(amb.id)} disabled={isRejecting}>
                                Révoquer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAmbassadors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucun ambassadeur trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-lg">Guides PDF ({adminProducts?.length || 0})</CardTitle>
              <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) { setCoverPreview(""); setPdfFileName(""); form.reset(); } }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary" data-testid="button-add-product">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter un Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Nouveau Guide PDF</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onCreateProduct)} className="space-y-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du guide</FormLabel>
                          <FormControl><Input placeholder="Guide Culture..." {...field} data-testid="input-product-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl><Textarea placeholder="Description détaillée du guide..." {...field} data-testid="input-product-description" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (FCFA)</FormLabel>
                          <FormControl><Input placeholder="500" {...field} data-testid="input-product-price" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="space-y-2">
                        <FormLabel>Image de couverture</FormLabel>
                        <div className="flex flex-col gap-3">
                          {coverPreview && (
                            <div className="relative w-full h-40 rounded-md overflow-hidden border">
                              <img src={coverPreview} alt="Aperçu" className="w-full h-full object-cover" data-testid="img-cover-preview" />
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, "create")}
                            data-testid="input-cover-file"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            data-testid="button-upload-cover"
                          >
                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {isUploading ? "Envoi en cours..." : "Choisir une image"}
                          </Button>
                          <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                            <FormItem>
                              <FormControl><Input placeholder="ou collez une URL : https://..." {...field} data-testid="input-product-image" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel className="text-destructive">Fichier PDF du guide (obligatoire) *</FormLabel>
                        <div className="flex flex-col gap-3">
                          {pdfFileName && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700 dark:text-green-400 truncate">{pdfFileName}</span>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={pdfInputRef}
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handlePdfSelect(e, "create")}
                            data-testid="input-pdf-file"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => pdfInputRef.current?.click()}
                            disabled={isUploadingPdf}
                            data-testid="button-upload-pdf"
                          >
                            {isUploadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {isUploadingPdf ? "Envoi du PDF..." : "Choisir le fichier PDF"}
                          </Button>
                          <p className="text-xs text-muted-foreground">Le fichier PDF est le contenu du guide. Il sera disponible au téléchargement après achat.</p>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-primary" disabled={isCreating || isUploading || isUploadingPdf} data-testid="button-submit-product">
                        {isCreating ? <Loader2 className="animate-spin" /> : "Créer le Guide"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>PDF</TableHead>
                      <TableHead>Actif</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminProducts?.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {p.coverImageUrl ? (
                            <img src={p.coverImageUrl} alt={p.name} className="w-14 h-14 rounded-md object-cover" data-testid={`img-product-cover-${p.id}`} />
                          ) : (
                            <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-product-${p.id}`}>{p.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{p.description}</TableCell>
                        <TableCell className="font-medium">{p.price} FCFA</TableCell>
                        <TableCell>
                          {p.fileUrl ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <FileText className="w-3 h-3 mr-1" /> Oui
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <X className="w-3 h-3 mr-1" /> Non
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={p.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                            {p.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => openEditDialog(p)} data-testid={`button-edit-product-${p.id}`}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => deleteProduct(p.id)} data-testid={`button-delete-product-${p.id}`}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) { setEditingProduct(null); setEditCoverPreview(""); setEditPdfFileName(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le Guide</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onUpdateProduct)} className="space-y-4">
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du guide</FormLabel>
                  <FormControl><Input {...field} data-testid="input-edit-product-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} data-testid="input-edit-product-description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (FCFA)</FormLabel>
                  <FormControl><Input {...field} data-testid="input-edit-product-price" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="space-y-2">
                <FormLabel>Image de couverture</FormLabel>
                <div className="flex flex-col gap-3">
                  {editCoverPreview && (
                    <div className="relative w-full h-40 rounded-md overflow-hidden border">
                      <img src={editCoverPreview} alt="Aperçu" className="w-full h-full object-cover" data-testid="img-edit-cover-preview" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "edit")}
                    data-testid="input-edit-cover-file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploading}
                    data-testid="button-edit-upload-cover"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploading ? "Envoi en cours..." : "Changer l'image"}
                  </Button>
                  <FormField control={editForm.control} name="coverImageUrl" render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="ou collez une URL : https://..." {...field} data-testid="input-edit-product-image" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="space-y-2">
                <FormLabel>Fichier PDF du guide</FormLabel>
                <div className="flex flex-col gap-3">
                  {editPdfFileName && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400 truncate">{editPdfFileName}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={editPdfInputRef}
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handlePdfSelect(e, "edit")}
                    data-testid="input-edit-pdf-file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editPdfInputRef.current?.click()}
                    disabled={isUploadingPdf}
                    data-testid="button-edit-upload-pdf"
                  >
                    {isUploadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploadingPdf ? "Envoi du PDF..." : "Changer le fichier PDF"}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={isUpdating || isUploading || isUploadingPdf} data-testid="button-update-product">
                {isUpdating ? <Loader2 className="animate-spin" /> : "Enregistrer les modifications"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
