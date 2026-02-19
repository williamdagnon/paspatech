import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-orange max-w-none"
        >
          <h1 className="text-4xl font-display font-bold text-primary mb-4">Politique de confidentialité</h1>
          <p className="text-lg text-muted-foreground mb-8">PASPA TECH</p>

          <p className="text-base mb-8">
            PASPA TECH s'engage à protéger les données personnelles de ses utilisateurs conformément aux principes du Règlement (UE) 2016/679 (RGPD), même si l'entreprise est située hors de l'Union européenne.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">1. Responsable du traitement</h2>
            <p>Le responsable du traitement des données est :</p>
            <p className="font-semibold">PASPA TECH</p>
            <p>Email : <a href="mailto:paspatech@gmail.com" className="text-primary hover:underline">paspatech@gmail.com</a></p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">2. Délégué à la Protection des Données (DPO)</h2>
            <p>Le DPO est interne à PASPA TECH.</p>
            <p>Contact DPO : <a href="mailto:paspatech@gmail.com" className="text-primary hover:underline">paspatech@gmail.com</a></p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">3. Données collectées</h2>
            <p>Nous collectons uniquement les données nécessaires :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nom</li>
              <li>Prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone / WhatsApp</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">4. Finalité du traitement</h2>
            <p>Les données sont utilisées pour :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>La vente de fichiers numériques (PDF)</li>
              <li>La gestion des commandes et paiements</li>
              <li>La communication avec les clients</li>
              <li>L'accès aux contenus achetés</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">5. Base légale du traitement</h2>
            <p>Le traitement repose sur :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>L'exécution d'un contrat (achat de PDF)</li>
              <li>Le consentement explicite de l'utilisateur</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">6. Durée de conservation</h2>
            <p>Les données sont conservées pour une durée maximale de 3 ans, sauf obligation légale contraire.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">7. Sécurité des données</h2>
            <p>PASPA TECH met en place des mesures de sécurité adaptées :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Accès limité aux données</li>
              <li>Protection par mot de passe</li>
              <li>Utilisation de services sécurisés</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">8. Transfert de données</h2>
            <p>Les données peuvent transiter via :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Hébergement web</li>
              <li>Application mobile</li>
              <li>Services de paiement</li>
              <li>WhatsApp</li>
            </ul>
            <p className="mt-2">Ces transferts sont réalisés dans le respect des principes RGPD.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">9. Droits des utilisateurs</h2>
            <p>Conformément au RGPD, l'utilisateur dispose des droits suivants :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Droit d'accès</li>
              <li>Droit de rectification</li>
              <li>Droit de suppression</li>
              <li>Droit d'opposition</li>
            </ul>
            <p className="mt-4">
              Toute demande peut être adressée à : <a href="mailto:paspatech@gmail.com" className="text-primary hover:underline">paspatech@gmail.com</a>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
