import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useProducts } from "@/hooks/use-paspa";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

const BANNERS = [
  {
    image: "https://i.postimg.cc/qM4mVzbj/Chat-GPT-Image-19-fevr-2026-11-40-47.png",
    title: "Révolution Agricole Africaine",
    subtitle: "Le savoir technologique au service de la terre."
  },
  {
    image: "https://i.postimg.cc/5tC5FVKq/plants_de_tomates_indetermines.webp",
    title: "Innovation Durable",
    subtitle: "Des techniques modernes pour une production optimisée."
  },
  {
    image: "https://i.postimg.cc/tgxdVjvk/5edf43a40cb6c_maxnewsworld931830_3216771.jpg",
    title: "Expertise Locale",
    subtitle: "Des guides conçus pour les réalités du terrain africain."
  }
];

export default function Landing() {
  const { data: products } = useProducts();
  const featuredProducts = products?.slice(0, 3);
  const plugin = React.useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  return (
    <div className="min-h-screen">
      {/* Hero / Banner Section */}
      <section className="relative h-[600px] w-full overflow-hidden">
        <Carousel 
          plugins={[plugin.current]}
          className="w-full h-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {BANNERS.map((banner, index) => (
              <CarouselItem key={index} className="relative h-[600px] w-full">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-start">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl text-white"
                  >
                    <span className="inline-block px-4 py-1 rounded-full bg-primary text-white text-sm font-bold mb-4">
                      PASPA TECH
                    </span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-xl">
                      {banner.subtitle}
                    </p>
                    <div className="flex gap-4">
                      <Link href="/products">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-12 px-8">
                          Voir les Guides
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="left-8 text-white bg-white/20 hover:bg-white/40 border-none" />
            <CarouselNext className="right-8 text-white bg-white/20 hover:bg-white/40 border-none" />
          </div>
        </Carousel>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-primary">Nos Guides PDF Phares</h2>
              <p className="text-muted-foreground text-lg">
                Découvrez nos guides les plus populaires, conçus par des experts pour maximiser vos rendements.
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="group gap-2 text-primary font-bold">
                Tous les guides <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts?.map((product: any) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -10 }}
                className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={product.coverImageUrl || "https://i.postimg.cc/MKKzZ0dh/prod_oignon.png"} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.price} FCFA
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                    {product.description}
                  </p>
                  <Link href={`/products/${product.id}`}>
                    <Button className="w-full bg-secondary hover:bg-secondary/90 text-white gap-2">
                      <Download className="w-4 h-4" /> Acheter le Guide
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50k+</div>
              <div className="text-white/80">PDFs Vendus</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-white/80">Ambassadeurs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-white/80">Pays Africains</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Brief */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-orange-500/10 rounded-3xl -rotate-3" />
              <img 
                src="https://i.postimg.cc/6pSL33c8/periode_de_plantation_oignon_rouge_9912.webp" 
                alt="About Paspa Tech"
                className="relative rounded-2xl shadow-2xl z-10"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-primary">Le savoir-faire au service de l'Afrique</h2>
              <p className="text-lg text-muted-foreground mb-8">
                PASPA TECH n'est pas qu'une plateforme de vente. C'est un écosystème conçu pour autonomiser les agriculteurs africains à travers le partage de connaissances de pointe.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-secondary w-6 h-6" />
                  <span>Expertise technique de terrain</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-secondary w-6 h-6" />
                  <span>Accessibilité financière (500 FCFA)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-secondary w-6 h-6" />
                  <span>Modèle économique inclusif pour ambassadeurs</span>
                </li>
              </ul>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  En savoir plus sur nous
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
