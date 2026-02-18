import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Comment recevoir mon guide après paiement ?",
    a: "Dès que le paiement est validé, un lien de téléchargement immédiat s'affiche sur votre écran et vous est également envoyé par email."
  },
  {
    q: "Quels sont les modes de paiement acceptés ?",
    a: "Nous acceptons les paiements via Mobile Money (Orange Money, Wave, etc.), Flutterwave et Paystack pour couvrir toute l'Afrique."
  },
  {
    q: "Comment devenir ambassadeur ?",
    a: "Il suffit de créer un compte dans la section 'Devenir Ambassadeur', de valider le contrat et vous pourrez commencer à partager vos liens de recommandation."
  },
  {
    q: "Quelle est la commission pour les ambassadeurs ?",
    a: "Les ambassadeurs reçoivent une commission de 70% sur chaque vente réalisée via leur lien unique. Les 30% restants reviennent à PASPA TECH."
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui, toutes les transactions sont sécurisées et cryptées par nos agrégateurs de paiement partenaires. Nous ne stockons aucune information bancaire."
  }
];

export default function FAQ() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-primary mb-8 text-center">Foire Aux Questions</h1>
        <p className="text-xl text-muted-foreground text-center mb-12">
          Trouvez des réponses rapides aux questions les plus fréquentes sur PASPA TECH.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-card border rounded-xl px-4">
              <AccordionTrigger className="text-left font-bold text-lg py-4 hover:no-underline hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
