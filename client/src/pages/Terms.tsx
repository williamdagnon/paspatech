import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose prose-orange max-w-none">
          <h1 className="text-4xl font-display font-bold text-primary mb-12">Conditions Générales et Confidentialité</h1>
          
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">1. Conditions Générales de Vente (CGV)</h2>
            <p>Les présents guides PDF sont la propriété exclusive de PASPA TECH. Toute revente ou reproduction sans autorisation est strictement interdite.</p>
            <p>Le prix de chaque guide est fixé à 500 FCFA, payable via les agrégateurs intégrés sur la plateforme.</p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">2. Système Ambassadeur</h2>
            <p>En devenant ambassadeur, vous acceptez de promouvoir nos produits de manière éthique. La commission est de 70% du prix de vente hors frais.</p>
            <p>Les paiements sont effectués automatiquement en monnaie locale via Mobile Money ou virement selon votre zone.</p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">3. Politique de Confidentialité (RGPD)</h2>
            <p>PASPA TECH s'engage à protéger vos données personnelles conformément aux normes européennes du RGPD.</p>
            <ul>
              <li>Collecte minimale de données nécessaire au service.</li>
              <li>Droit d'accès, de rectification et de suppression de vos données.</li>
              <li>Sécurité renforcée des transactions et des mots de passe.</li>
            </ul>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">4. Autorisation Parentale</h2>
            <p>L'utilisation de la plateforme en tant qu'ambassadeur par un mineur nécessite une autorisation parentale expresse.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
