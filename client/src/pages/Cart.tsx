import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-4">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-8">
            Découvrez nos guides agricoles PDF et ajoutez-les à votre panier.
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

  return (
    <div className="py-12 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <h1 className="text-3xl font-bold font-display text-primary">
              Mon Panier
              <Badge className="ml-3">{totalItems} article{totalItems > 1 ? "s" : ""}</Badge>
            </h1>
            <Link href="/products">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continuer les achats
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-4">
                    <div className="flex gap-4">
                      {item.product.coverImageUrl && (
                        <img
                          src={item.product.coverImageUrl}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate" data-testid={`text-cart-product-${item.product.id}`}>
                          {item.product.name}
                        </h3>
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
                          {item.product.description}
                        </p>
                        <p className="text-primary font-bold mt-2" data-testid={`text-cart-price-${item.product.id}`}>
                          {Number(item.product.price)} FCFA
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product.id)}
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-bold" data-testid={`text-qty-${item.product.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div>
              <Card className="p-6 space-y-5 sticky top-24">
                <h3 className="font-bold text-lg">Récapitulatif</h3>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm gap-2">
                      <span className="text-muted-foreground truncate">{item.product.name} x{item.quantity}</span>
                      <span className="font-medium whitespace-nowrap">{Number(item.product.price) * item.quantity} FCFA</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-cart-total">{totalPrice} FCFA</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary underline">Connectez-vous</Link> pour associer vos achats à votre compte.
                  </div>
                )}

                <Link href="/checkout">
                  <Button
                    className="w-full h-12 text-base"
                    data-testid="button-checkout"
                  >
                    Procéder au paiement <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3 text-green-600" />
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Flutterwave, Paystack, Mobile Money
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
