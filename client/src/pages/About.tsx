import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-orange max-w-none"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary mb-8 text-center">À Propos de PASPA TECH</h1>
          
          <p className="text-xl leading-relaxed text-muted-foreground mb-12 text-center">
            PASPA TECH est une plateforme innovante dédiée à la démocratisation du savoir agricole en Afrique. 
            Notre mission est d'accompagner la révolution agricole africaine par la technologie et l'expertise.
          </p>

          <div className="grid md:grid-cols-2 gap-12 my-16">
            <div className="bg-muted p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-primary">Notre Vision</h3>
              <p>Voir une Afrique autosuffisante, où chaque agriculteur a accès aux meilleures techniques de culture pour transformer sa production en une entreprise prospère.</p>
            </div>
            <div className="bg-muted p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-primary">Notre Mission</h3>
              <p>Fournir des guides techniques de haute qualité à un prix symbolique et créer des opportunités économiques à travers notre réseau d'ambassadeurs.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mt-16 mb-8">Pourquoi nous choisir ?</h2>
          <p>
            Nous comprenons les défis uniques de l'agriculture en Afrique. Nos guides sont rédigés par des experts qui ont une expérience réelle du terrain, garantissant que les conseils sont pratiques, actionnables et adaptés au climat et aux sols africains.
          </p>
          
          <h2 className="text-3xl font-bold mt-16 mb-8">L'Engagement RGPD</h2>
          <p>
            PASPA TECH applique volontairement les normes de protection des données de l'Union Européenne (RGPD), avec un DPO interne, pour garantir la sécurité et la confidentialité de vos informations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
