import { useProduct } from "@/hooks/use-paspa";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, ShoppingBag, ShieldCheck, Download, FileText } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: product, isLoading, error } = useProduct(id);
  const { addToCart } = useCart();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
          <Link href="/products">
            <Button className="bg-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux Guides
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getProductImage = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("oignon")) return "https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&q=80&w=1200";
    if (lower.includes("tomate")) return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1200";
    if (lower.includes("piment")) return "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&q=80&w=1200";
    if (lower.includes("manioc")) return "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?auto=format&fit=crop&q=80&w=1200";
    if (lower.includes("gingembre")) return "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=1200";
    return "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=1200";
  };

  function handleBuyGuide() {
    addToCart(product);
    setLocation("/checkout");
  }

  const imageUrl = product.coverImageUrl || getProductImage(product.name);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour aux Guides</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground shadow-lg text-sm px-3 py-1">
                  Guide PDF
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <Card className="p-3 text-center">
                <FileText className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Format PDF</p>
              </Card>
              <Card className="p-3 text-center">
                <Download className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Téléchargement immédiat</p>
              </Card>
              <Card className="p-3 text-center">
                <ShieldCheck className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Paiement sécurisé</p>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="mb-2">
              <Badge variant="outline" className="text-xs mb-3">PASPA TECH - Guide Agricole</Badge>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4" data-testid="text-product-title">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-primary" data-testid="text-product-price">
                {product.price} FCFA
              </span>
              <span className="text-sm text-muted-foreground">/ exemplaire</span>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-3">Description</h3>
              <p className="text-foreground leading-relaxed" data-testid="text-product-description">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Ce guide inclut</h3>
              <div className="grid grid-cols-2 gap-3">
                {["Techniques de semis", "Irrigation optimale", "Lutte antiparasitaire", "Récolte et conservation", "Commercialisation", "Calendrier cultural"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <Button
                className="w-full bg-primary h-14 text-lg"
                onClick={handleBuyGuide}
                data-testid="button-buy-guide"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Acheter le Guide - {product.price} FCFA
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Propriété exclusive PASPA TECH</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ce guide est protégé par le droit d'auteur. Toute reproduction ou revente est strictement interdite.
                    Le téléchargement est disponible immédiatement après confirmation du paiement.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
