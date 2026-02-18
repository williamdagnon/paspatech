import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose prose-orange max-w-none">
          <h1 className="text-4xl font-display font-bold text-primary mb-12">Politique de Confidentialité</h1>
          
          <p className="text-lg mb-8">Chez PASPA TECH, nous accordons une importance capitale à la protection de vos données personnelles.</p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Collecte des données</h2>
            <p>Nous collectons les informations nécessaires à la réalisation de vos achats et à votre inscription en tant qu'ambassadeur (nom, email, téléphone, pays).</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour la gestion de vos commandes, l'envoi des liens de téléchargement et le paiement de vos commissions.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Sécurité</h2>
            <p>Nous appliquons les standards de sécurité les plus stricts pour protéger vos données contre tout accès non autorisé. Les paiements sont gérés par des prestataires certifiés PCI-DSS.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Vos droits (RGPD)</h2>
            <p>Vous bénéficiez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données. Vous pouvez également vous opposer au traitement de vos données pour des motifs légitimes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
