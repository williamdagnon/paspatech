import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <AlertTriangle className="w-10 h-10 text-orange-500" />
      </div>
      
      <h1 className="text-4xl font-display font-bold mb-4">Page non trouvée</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        La page que vous cherchez semble avoir disparu dans les champs. Revenons à la maison.
      </p>

      <Link href="/">
        <Button size="lg" className="bg-gradient-paspa">
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
}
