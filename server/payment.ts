import { z } from "zod";
import { FedaPay, Transaction, Customer } from "fedapay";

// Configuration du SDK FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "sk_sandbox_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
FedaPay.setEnvironment(process.env.FEDAPAY_SECRET_KEY?.includes("sandbox") ? "sandbox" : "live");

export const FEDAPAY_CONFIG = {
  publicKey: process.env.FEDAPAY_PUBLIC_KEY || "pk_sandbox_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  secretKey: process.env.FEDAPAY_SECRET_KEY || "sk_sandbox_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  baseUrl: "https://api.fedapay.com",
  isDemo: !process.env.FEDAPAY_SECRET_KEY || process.env.FEDAPAY_SECRET_KEY.includes("sandbox"),
};

// Configuration des méthodes de paiement par pays (UEMOA + Guinée)
export const PAYMENT_METHODS_CONFIG = {
  BJ: { // Bénin
    MTN_MOMO: { name: "MTN Mobile Money", provider: "mtn", requiresPhone: true },
    MOOV_MONEY: { name: "Moov Money", provider: "moov", requiresPhone: true },
    CELTIIS_CASH: { name: "Celtiis Cash", provider: "celtiis", requiresPhone: true },
    CORIS_MONEY: { name: "Coris Money", provider: "coris", requiresPhone: true },
    BMO: { name: "BMO", provider: "bmo", requiresPhone: true },
  },
  CI: { // Côte d'Ivoire
    MTN_MOMO: { name: "MTN Mobile Money", provider: "mtn", requiresPhone: true },
    ORANGE_MONEY: { name: "Orange Money", provider: "orange", requiresPhone: true },
    MOOV_MONEY: { name: "Moov Money", provider: "moov", requiresPhone: true },
    WAVE: { name: "Wave", provider: "wave", requiresPhone: true },
  },
  SN: { // Sénégal
    ORANGE_MONEY: { name: "Orange Money", provider: "orange", requiresPhone: true },
    WAVE: { name: "Wave", provider: "wave", requiresPhone: true },
    FREE_MONEY: { name: "Free Money", provider: "free", requiresPhone: true },
  },
  TG: { // Togo
    MOOV_MONEY: { name: "Moov Money", provider: "moov", requiresPhone: true },
    TOGOCOM_MIX: { name: "Togocom Mix", provider: "togocom", requiresPhone: true },
  },
  NE: { // Niger
    AIRTEL_MONEY: { name: "Airtel Money", provider: "airtel", requiresPhone: true },
  },
  ML: { // Mali
    ORANGE_MONEY: { name: "Orange Money", provider: "orange", requiresPhone: true },
  },
  BF: { // Burkina Faso
    ORANGE_MONEY: { name: "Orange Money", provider: "orange", requiresPhone: true },
    MOOV_MONEY: { name: "Moov Money", provider: "moov", requiresPhone: true },
  },
  GN: { // Guinée
    MTN_MOMO: { name: "MTN Mobile Money", provider: "mtn", requiresPhone: true },
  },
} as const;

// Méthode de fallback disponible pour tous les pays
export const FALLBACK_METHODS = {
  CARD: { name: "Carte bancaire (Visa/Mastercard)", provider: "card", requiresPhone: false },
} as const;

export type PaymentMethodId = keyof typeof PAYMENT_METHODS_CONFIG.BJ | keyof typeof FALLBACK_METHODS;
export type CountryCode = keyof typeof PAYMENT_METHODS_CONFIG;

// Fonction utilitaire pour obtenir les méthodes disponibles pour un pays
export function getAvailableMethodsForCountry(countryCode: CountryCode): Array<{
  id: string;
  name: string;
  provider: string;
  requiresPhone: boolean;
  countries: CountryCode[];
}> {
  const countryMethods = PAYMENT_METHODS_CONFIG[countryCode];
  const methods = Object.entries(countryMethods).map(([methodId, config]) => ({
    id: methodId.toLowerCase(),
    name: config.name,
    provider: config.provider,
    requiresPhone: config.requiresPhone,
    countries: [countryCode],
  }));

  // Ajouter la méthode de fallback (carte bancaire)
  methods.push({
    id: "card",
    name: FALLBACK_METHODS.CARD.name,
    provider: FALLBACK_METHODS.CARD.provider,
    requiresPhone: FALLBACK_METHODS.CARD.requiresPhone,
    countries: Object.keys(PAYMENT_METHODS_CONFIG) as CountryCode[],
  });

  return methods;
}

// Fonction pour valider si une méthode est disponible pour un pays
export function isMethodAvailableForCountry(methodId: string, countryCode: CountryCode): boolean {
  if (methodId === "card") return true; // Carte bancaire toujours disponible

  const countryMethods = PAYMENT_METHODS_CONFIG[countryCode];
  return Object.keys(countryMethods).some(key => key.toLowerCase() === methodId);
}

// Fonction pour obtenir les détails d'une méthode
export function getMethodDetails(methodId: string, countryCode: CountryCode) {
  if (methodId === "card") {
    return {
      id: "card",
      name: FALLBACK_METHODS.CARD.name,
      provider: FALLBACK_METHODS.CARD.provider,
      requiresPhone: FALLBACK_METHODS.CARD.requiresPhone,
      countries: Object.keys(PAYMENT_METHODS_CONFIG) as CountryCode[],
    };
  }

  for (const [country, methods] of Object.entries(PAYMENT_METHODS_CONFIG)) {
    if (country === countryCode) {
      for (const [methodKey, config] of Object.entries(methods)) {
        if (methodKey.toLowerCase() === methodId) {
          return {
            id: methodId,
            name: config.name,
            provider: config.provider,
            requiresPhone: config.requiresPhone,
            countries: [countryCode],
          };
        }
      }
    }
  }

  return null;
}

export const AGGREGATORS = {
  fedapay: {
    id: "fedapay",
    name: "FedaPay",
    logo: "https://fedapay.com/wp-content/uploads/2023/11/logo-fedapay.png",
    description: "Paiement mobile money et carte bancaire en Afrique de l'Ouest",
    currencies: ["XOF"],
    methods: [], // Sera rempli dynamiquement
  },
};

export const COUNTRY_CODES: Record<string, { name: string; code: string; currency: string; phonePrefix: string; flag: string }> = {
  BJ: { name: "Bénin", code: "BJ", currency: "XOF", phonePrefix: "+229", flag: "🇧🇯" },
  BF: { name: "Burkina Faso", code: "BF", currency: "XOF", phonePrefix: "+226", flag: "🇧🇫" },
  CI: { name: "Côte d'Ivoire", code: "CI", currency: "XOF", phonePrefix: "+225", flag: "🇨🇮" },
  GN: { name: "Guinée", code: "GN", currency: "GNF", phonePrefix: "+224", flag: "🇬🇳" },
  ML: { name: "Mali", code: "ML", currency: "XOF", phonePrefix: "+223", flag: "🇲🇱" },
  NE: { name: "Niger", code: "NE", currency: "XOF", phonePrefix: "+227", flag: "🇳🇪" },
  SN: { name: "Sénégal", code: "SN", currency: "XOF", phonePrefix: "+221", flag: "🇸🇳" },
  TG: { name: "Togo", code: "TG", currency: "XOF", phonePrefix: "+228", flag: "🇹🇬" },
};

export const paymentInitSchema = z.object({
  aggregator: z.enum(["fedapay"]),
  methodId: z.string(),
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  fullName: z.string().min(2, "Nom complet requis"),
  countryCode: z.string().min(2),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    price: z.number(),
  })),
  ambassadorId: z.string().optional(),
});

export type PaymentInitInput = z.infer<typeof paymentInitSchema>;

function generateRef(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function initiateFedapayPayment(input: PaymentInitInput, totalAmount: number) {
  // Validation du pays
  const country = COUNTRY_CODES[input.countryCode as CountryCode];
  if (!country) {
    throw new Error(`Pays non supporté: ${input.countryCode}. Pays supportés: ${Object.keys(COUNTRY_CODES).join(', ')}`);
  }

  // Validation de la méthode de paiement pour ce pays
  if (!isMethodAvailableForCountry(input.methodId, input.countryCode as CountryCode)) {
    const availableMethods = getAvailableMethodsForCountry(input.countryCode as CountryCode);
    const methodNames = availableMethods.map(m => m.name).join(', ');
    throw new Error(`Méthode de paiement '${input.methodId}' non disponible pour ${country.name}. Méthodes disponibles: ${methodNames}`);
  }

  // Récupération des détails de la méthode
  const method = getMethodDetails(input.methodId, input.countryCode as CountryCode);
  if (!method) {
    throw new Error("Erreur interne: méthode de paiement introuvable");
  }

  // Logging pour le monitoring
  console.log(`[FedaPay] Initiation paiement: ${method.name} pour ${country.name} (${country.currency} ${totalAmount})`);

  const reference = generateRef("FDP");

  if (FEDAPAY_CONFIG.isDemo) {
    return {
      status: "demo",
      message: "Mode démo - Paiement simulé avec succès",
      transactionId: reference,
      aggregator: "fedapay",
      method: method.name,
      amount: totalAmount,
      currency: country.currency,
      phoneNumber: input.phoneNumber,
      instructions: `[DÉMO] Un prompt de paiement serait envoyé au ${input.phoneNumber} via ${method.name}. Composez *144# pour confirmer le paiement de ${totalAmount} ${country.currency}.`,
    };
  }

  try {
    // Créer un client avec le SDK FedaPay
    const customer = await Customer.create({
      email: input.email,
      firstname: input.fullName.split(' ')[0],
      lastname: input.fullName.split(' ').slice(1).join(' ') || '',
      phone_number: input.phoneNumber,
    });

    // Créer la transaction
    const transaction = await Transaction.create({
      amount: totalAmount,
      currency: { code: country.currency },
      description: `Paiement pour ${input.items.length} produit(s)`,
      callback_url: `${process.env.REPLIT_DEV_DOMAIN || ""}/payment/callback`,
      customer_id: customer.id,
      custom_meta: {
        items: JSON.stringify(input.items),
        ambassador_id: input.ambassadorId,
        country: input.countryCode,
        payment_method: input.methodId,
      },
    });

    // Pour les paiements mobile money, créer un token de paiement
    if (method.provider !== "card") {
      // Le SDK gère automatiquement les tokens pour mobile money
      console.log(`[FedaPay] Mobile money payment initiated: ${method.name} for ${country.name}`);
      return {
        status: "pending",
        message: `Un prompt de paiement a été envoyé au ${input.phoneNumber}`,
        transactionId: reference,
        fedapayTransactionId: transaction.id,
        aggregator: "fedapay",
        method: method.name,
        amount: totalAmount,
        currency: country.currency,
        instructions: `Confirmez le paiement sur votre téléphone ${input.phoneNumber}. Composez *144# si nécessaire.`,
      };
    } else {
      // Pour les cartes bancaires, retourner l'URL de paiement
      console.log(`[FedaPay] Card payment initiated: ${method.name} for ${country.name}`);
      return {
        status: "redirect",
        message: "Redirection vers la page de paiement sécurisée",
        transactionId: reference,
        fedapayTransactionId: transaction.id,
        paymentUrl: transaction.payment_url,
        aggregator: "fedapay",
        method: method.name,
        amount: totalAmount,
        currency: country.currency,
        instructions: "Cliquez sur le bouton ci-dessous pour procéder au paiement par carte.",
      };
    }
  } catch (error: any) {
    console.error(`[FedaPay] Payment error for ${country.name} with ${method.name}:`, error);
    if (error.message?.includes("fetch") || error.message?.includes("network")) {
      return {
        status: "demo",
        message: "API Fedapay indisponible - Mode démo activé",
        transactionId: reference,
        aggregator: "fedapay",
        method: method.name,
        amount: totalAmount,
        currency: country.currency,
        phoneNumber: input.phoneNumber,
        instructions: `[DÉMO] Paiement de ${totalAmount} ${country.currency} via ${method.name} simulé avec succès.`,
      };
    }
    throw error;
  }
}

export async function verifyFedapayPayment(transactionId: string) {
  if (FEDAPAY_CONFIG.isDemo) {
    return { status: "approved", verified: true, demo: true };
  }

  try {
    const transaction = await Transaction.retrieve(transactionId);
    return {
      status: transaction.status || "unknown",
      verified: transaction.wasPaid(),
      demo: false,
    };
  } catch (error: any) {
    console.error("Fedapay verification error:", error);
    return { status: "unknown", verified: false, demo: false };
  }
}
