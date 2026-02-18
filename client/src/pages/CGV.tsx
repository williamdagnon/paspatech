import { motion } from "framer-motion";

export default function CGV() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose prose-orange max-w-none">
          <h1 className="text-4xl font-display font-bold text-primary mb-12">Conditions Générales de Vente (CGV)</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Objet</h2>
            <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre PASPA TECH et toute personne physique ou morale procédant à l'achat de guides numériques sur le site.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Produits et Tarifs</h2>
            <p>Les produits vendus sont des guides au format PDF portant sur des techniques agricoles. Le prix unitaire est fixé à 500 FCFA. PASPA TECH se réserve le droit de modifier ses prix à tout moment.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Commande et Paiement</h2>
            <p>La validation de la commande implique l'acceptation des présentes CGV. Le paiement s'effectue via les solutions de paiement sécurisées intégrées (Mobile Money, Flutterwave, Paystack).</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Livraison</h2>
            <p>S'agissant de produits numériques, la livraison est immédiate après validation du paiement. Un lien de téléchargement est généré instantanément.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Droit de Rétractation</h2>
            <p>Conformément à la réglementation sur les contenus numériques fournis sur support immatériel, le droit de rétractation ne peut être exercé une fois que le téléchargement a commencé.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Propriété Intellectuelle</h2>
            <p>Tous les guides sont la propriété exclusive de PASPA TECH. Toute reproduction, revente ou diffusion non autorisée est passible de poursuites judiciaires.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
