import { motion } from "framer-motion";

export default function MentionsLegales() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose prose-orange max-w-none">
          <h1 className="text-4xl font-display font-bold text-primary mb-12">Mentions Légales</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Édition du site</h2>
            <p>Le présent site est édité par PASPA TECH, société spécialisée dans le conseil et la formation agricole en Afrique.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Hébergement</h2>
            <p>Le site est hébergé par Replit, Inc. situé à San Francisco, USA.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site (textes, images, PDF) est protégé par le droit d'auteur. Toute exploitation non autorisée sera considérée comme constitutive d'une contrefaçon.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Protection des données</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de modification et de suppression de vos données. Pour toute demande, contactez : support@paspatech.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
