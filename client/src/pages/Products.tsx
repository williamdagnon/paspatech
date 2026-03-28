import { useProducts } from "@/hooks/use-paspa";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag } from "lucide-react";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";

export default function Products() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-display font-bold mb-4">Nos Guides Techniques</h1>
        <p className="text-muted-foreground text-lg">
          Des manuels experts pour maîtriser vos cultures africaines.
          Achetez et téléchargez-les après paiement sécurisé.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products?.map((product: Product, index: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [, setLocation] = useLocation();

  const getProductImage = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("oignon")) return "https://i.postimg.cc/MKKzZ0dh/prod_oignon.png";
    if (lower.includes("tomate")) return "https://i.postimg.cc/g06zFYNL/prod_tomate.png";
    if (lower.includes("piment")) return "https://i.postimg.cc/zfRzZJ0K/prod_piment_rouge.png";
    if (lower.includes("manioc")) return "https://i.postimg.cc/pXXPVQsN/prod_manioc.png";
    if (lower.includes("gingembre")) return "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=600";
    return "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600";
  };

  function handleBuyGuide() {
    addToCart(product);
    setLocation("/checkout");
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.coverImageUrl || getProductImage(product.name)}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white text-foreground shadow-sm font-bold">
            {product.price} FCFA
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-2" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-5 flex-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex gap-3">
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full"
              data-testid={`button-view-product-${product.id}`}
            >
              Voir détails
            </Button>
          </Link>
          <Button
            className="flex-1 bg-primary"
            onClick={handleBuyGuide}
            data-testid={`button-buy-guide-${product.id}`}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Acheter
          </Button>
        </div>
      </div>
    </Card>
  );
}
