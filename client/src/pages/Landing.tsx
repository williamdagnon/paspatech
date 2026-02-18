import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, Users, Globe2, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent rounded-bl-[100px]" />
        
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Column: Text */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Révolution Agricole Africaine
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                L'avenir de l'agriculture <span className="text-gradient-paspa">africaine</span> est ici.
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                PASPA TECH connecte le savoir agricole aux entrepreneurs de demain. 
                Accédez à des guides techniques premium et transformez votre production.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-gradient-paspa text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 h-12 px-8 text-lg">
                    Acheter un Guide
                  </Button>
                </Link>
                <Link href="/ambassador/signup">
                  <Button size="lg" variant="outline" className="border-2 h-12 px-8 text-lg hover:bg-muted/50">
                    Devenir Ambassadeur
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Dynamic Images Grid */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                   {/* Smart farming tablet in field */}
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://pixabay.com/get/g7817b27f31eb0983568ecc127247e10528bf4691b050427ec7a5468370ac9fc61c3ec71f0478d3a39139f021f8f6ddc69e8e3f835ef9c2fcf5fe0a0f977d07ce_1280.jpg" 
                      alt="Agricultural technology tablet"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                      <span className="text-white font-medium">Technologie</span>
                    </div>
                  </div>
                  {/* African farmer smiling */}
                  <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800" 
                      alt="Modern African Farmer"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Drone spraying field */}
                  <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&q=80&w=800" 
                      alt="Crop Growth"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  {/* Greenhouse high tech */}
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800" 
                      alt="Greenhouse innovation"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                      <span className="text-white font-medium">Innovation</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Pourquoi PASPA TECH ?</h2>
            <p className="text-muted-foreground">
              Une plateforme conçue pour les réalités du terrain africain, alliant expertise technique et opportunités économiques.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Download}
              title="Savoir Accessible"
              description="Des guides PDF techniques complets (Oignon, Tomate, etc.) téléchargeables instantanément pour seulement 500 FCFA."
            />
            <FeatureCard 
              icon={Users}
              title="Système Ambassadeur"
              description="Gagnez 70% de commission sur chaque vente. Rejoignez notre réseau d'ambassadeurs à travers l'Afrique."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Paiement Sécurisé"
              description="Payez simplement via Mobile Money, Flutterwave ou Paystack. Transactions cryptées et sécurisées."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-paspa relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Prêt à transformer votre agriculture ?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Accédez dès maintenant à nos guides experts ou commencez à générer des revenus en partageant le savoir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/products">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold h-14 px-8 shadow-xl">
                  Voir les Guides
                </Button>
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
