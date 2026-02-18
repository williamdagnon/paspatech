import { useProducts, useCreateOrder } from "@/hooks/use-paspa";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Download, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Order form schema
const orderFormSchema = z.object({
  paymentMethod: z.enum(["flutterwave", "paystack", "mobile_money"]),
  phone: z.string().min(8, "Numéro requis pour le paiement"),
  email: z.string().email("Email requis pour recevoir le PDF").optional(),
});

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
        <h1 className="text-4xl font-display font-bold mb-4">Guides Techniques</h1>
        <p className="text-muted-foreground text-lg">
          Des manuels experts pour maîtriser vos cultures. Téléchargement immédiat après paiement sécurisé.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { user } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paymentMethod: "mobile_money",
      phone: "",
      email: user?.email || "",
    },
  });

  const onSubmit = (data: z.infer<typeof orderFormSchema>) => {
    // Simulate payment delay
    setTimeout(() => {
      createOrder({
        productId: product.id,
        amount: Number(product.price),
        paymentMethod: data.paymentMethod,
        guestEmail: data.email,
        guestPhone: data.phone,
      }, {
        onSuccess: () => {
          setIsSuccess(true);
        }
      });
    }, 1500);
  };

  // Static images mapping based on product name (simulated)
  const getProductImage = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('oignon')) return "https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&q=80&w=600";
    if (lower.includes('tomate')) return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600";
    if (lower.includes('piment')) return "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600";
    return "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600"; // Generic veggies
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getProductImage(product.name)} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-foreground font-bold px-3 py-1 rounded-full text-sm shadow-sm">
          {product.price} FCFA
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-6 flex-1">{product.description}</p>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setIsSuccess(false);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primary/90">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Acheter Maintenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-center">Paiement Sécurisé</DialogTitle>
            </DialogHeader>
            
            {isSuccess ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-700">Paiement Réussi !</h3>
                <p className="text-muted-foreground">Votre guide est prêt à être téléchargé.</p>
                <Button className="w-full gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  Télécharger le PDF
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                  <div className="bg-muted/50 p-4 rounded-lg mb-4 text-center">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-2xl font-bold text-primary mt-1">{product.price} FCFA</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Moyen de paiement</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-3"
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="mobile_money" id="mobile_money" className="peer sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="mobile_money"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              >
                                <span className="mb-2 text-xl">📱</span>
                                <span className="text-xs font-medium">Mobile Money</span>
                              </Label>
                            </FormItem>
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="flutterwave" id="flutterwave" className="peer sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="flutterwave"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              >
                                <span className="mb-2 text-xl">🌍</span>
                                <span className="text-xs font-medium">Flutterwave</span>
                              </Label>
                            </FormItem>
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="paystack" id="paystack" className="peer sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="paystack"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              >
                                <span className="mb-2 text-xl">💳</span>
                                <span className="text-xs font-medium">Paystack</span>
                              </Label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="+221 77..." {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {!user && (
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (pour recevoir le guide)</FormLabel>
                            <FormControl>
                              <Input placeholder="votre@email.com" {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-gradient-paspa h-12 text-lg font-bold" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      `Payer ${product.price} FCFA`
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Paiement sécurisé et crypté
                  </p>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
