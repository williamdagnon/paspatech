import { Link } from "wouter";
import { Sprout, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-paspa">
                <img src="https://i.postimg.cc/jdCbNxPv/Whats_App_Image_2026_02_17_at_22_45_00.jpg" className="rounded-3xl" />
              </div>
              <span className="text-xl font-bold font-display text-primary">PASPA TECH</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              L'avenir de l'agriculture africaine passe par la technologie et le savoir.
              Rejoignez la révolution verte.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">Nos Guides PDF</Link></li>
              <li><Link href="/ambassador/signup" className="hover:text-primary transition-colors">Devenir Ambassadeur</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">À Propos</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cgv" className="hover:text-primary transition-colors">CGV</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Politique de Confidentialité</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions Légales</Link></li>
              <li className="text-xs pt-2 opacity-75">PASPA TECH applique les normes RGPD de l'UE</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Contact</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="p-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">support@paspatech.com</p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PASPA TECH. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
