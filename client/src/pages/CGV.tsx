import { motion } from "framer-motion";

export default function CGV() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-orange max-w-none"
        >
          <h1 className="text-4xl font-display font-bold text-primary mb-4">Conditions Générales de Vente (CGV)</h1>
          <p className="text-lg text-muted-foreground mb-8">Produits numériques — PDF</p>

          <p className="text-base mb-8">
            Les présentes Conditions Générales de Vente régissent la vente de fichiers numériques (PDF) proposée par PASPA TECH.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">1. Produits</h2>
            <p>PASPA TECH vend des contenus numériques téléchargeables :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Formations (plans d'affaires agricoles)</li>
              <li>Ebooks éducatifs pour élèves</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">2. Commande</h2>
            <p>Toute commande effectuée sur le site web ou l'application mobile implique l'acceptation pleine et entière des présentes CGV.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">3. Prix et paiement</h2>
            <p>Les paiements sont effectués via :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Moov Money</li>
              <li>LemFi</li>
              <li>WorldRemit</li>
              <li>TerraPay</li>
            </ul>
            <p className="mt-2">Les prix sont affichés avant paiement.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">4. Livraison</h2>
            <p>Les produits sont livrés automatiquement par téléchargement après confirmation du paiement.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">5. Absence de droit de rétractation</h2>
            <p>Conformément à la réglementation applicable aux contenus numériques, aucun remboursement n'est possible après téléchargement.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">6. Utilisation des contenus</h2>
            <p>Les fichiers PDF sont destinés à un usage strictement personnel et éducatif.</p>
            <p>Toute reproduction, revente ou partage non autorisé est interdit.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">7. Responsabilité</h2>
            <p>PASPA TECH ne saurait être tenu responsable d'une mauvaise utilisation des contenus.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">8. Données personnelles</h2>
            <p>Les données personnelles sont traitées conformément à la Politique de confidentialité RGPD.</p>
            <p className="mt-2">
              Contact : <a href="mailto:paspatech@gmail.com" className="text-primary hover:underline">paspatech@gmail.com</a>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
