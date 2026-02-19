import { z } from "zod";

export const FLUTTERWAVE_CONFIG = {
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK-demo-X",
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY || "FLWSECK-demo-X",
  baseUrl: "https://api.flutterwave.com/v3",
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || "",
  isDemo: !process.env.FLUTTERWAVE_SECRET_KEY,
};

export const PAYSTACK_CONFIG = {
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || "pk_test_demo",
  secretKey: process.env.PAYSTACK_SECRET_KEY || "sk_test_demo",
  baseUrl: "https://api.paystack.co",
  isDemo: !process.env.PAYSTACK_SECRET_KEY,
};

export const AGGREGATORS = {
  flutterwave: {
    id: "flutterwave",
    name: "Flutterwave",
    logo: "https://cdn.filestackcontent.com/OITnhHdTQymsUI1bkkPo",
    description: "Paiement mobile money et carte bancaire en Afrique",
    currencies: ["XOF", "XAF", "NGN", "GHS", "KES", "UGX", "RWF", "TZS", "ZMW"],
    methods: [
      {
        id: "mtn_money",
        name: "MTN Mobile Money",
        icon: "smartphone",
        countries: ["CI", "GH", "UG", "RW", "ZM", "CM"],
        countriesLabel: "Côte d'Ivoire, Ghana, Ouganda, Rwanda, Zambie, Cameroun",
        requiresPhone: true,
        network: "MTN",
      },
      {
        id: "orange_money",
        name: "Orange Money",
        icon: "smartphone",
        countries: ["CI", "SN", "CM", "BF", "ML"],
        countriesLabel: "Côte d'Ivoire, Sénégal, Cameroun, Burkina Faso, Mali",
        requiresPhone: true,
        network: "orangemoney",
      },
      {
        id: "moov_money",
        name: "Moov Money",
        icon: "smartphone",
        countries: ["CI", "BJ", "TG", "NE"],
        countriesLabel: "Côte d'Ivoire, Bénin, Togo, Niger",
        requiresPhone: true,
        network: "moov",
      },
      {
        id: "wave",
        name: "Wave",
        icon: "smartphone",
        countries: ["SN", "CI", "ML", "BF"],
        countriesLabel: "Sénégal, Côte d'Ivoire, Mali, Burkina Faso",
        requiresPhone: true,
        network: "wave",
      },
      {
        id: "mpesa_flw",
        name: "M-Pesa",
        icon: "smartphone",
        countries: ["KE", "TZ"],
        countriesLabel: "Kenya, Tanzanie",
        requiresPhone: true,
        network: "mpesa",
      },
      {
        id: "airtel_money",
        name: "Airtel Money",
        icon: "smartphone",
        countries: ["KE", "UG", "TZ", "RW", "ZM"],
        countriesLabel: "Kenya, Ouganda, Tanzanie, Rwanda, Zambie",
        requiresPhone: true,
        network: "airtel",
      },
    ],
  },
  paystack: {
    id: "paystack",
    name: "Paystack",
    logo: "https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png",
    description: "Paiement sécurisé pour le Ghana et le Kenya",
    currencies: ["GHS", "KES", "NGN"],
    methods: [
      {
        id: "mtn_gh",
        name: "MTN MoMo (Ghana)",
        icon: "smartphone",
        countries: ["GH"],
        countriesLabel: "Ghana",
        requiresPhone: true,
        provider: "mtn",
      },
      {
        id: "telecel_gh",
        name: "Telecel Cash (Ghana)",
        icon: "smartphone",
        countries: ["GH"],
        countriesLabel: "Ghana",
        requiresPhone: true,
        provider: "tgo",
      },
      {
        id: "airteltigo_gh",
        name: "AirtelTigo Money (Ghana)",
        icon: "smartphone",
        countries: ["GH"],
        countriesLabel: "Ghana",
        requiresPhone: true,
        provider: "atl",
      },
      {
        id: "mpesa_ke",
        name: "M-Pesa (Kenya)",
        icon: "smartphone",
        countries: ["KE"],
        countriesLabel: "Kenya",
        requiresPhone: true,
        provider: "mpesa",
      },
    ],
  },
};

export const COUNTRY_CODES: Record<string, { name: string; code: string; currency: string; phonePrefix: string }> = {
  CI: { name: "Côte d'Ivoire", code: "CI", currency: "XOF", phonePrefix: "+225" },
  SN: { name: "Sénégal", code: "SN", currency: "XOF", phonePrefix: "+221" },
  ML: { name: "Mali", code: "ML", currency: "XOF", phonePrefix: "+223" },
  BF: { name: "Burkina Faso", code: "BF", currency: "XOF", phonePrefix: "+226" },
  TG: { name: "Togo", code: "TG", currency: "XOF", phonePrefix: "+228" },
  BJ: { name: "Bénin", code: "BJ", currency: "XOF", phonePrefix: "+229" },
  NE: { name: "Niger", code: "NE", currency: "XOF", phonePrefix: "+227" },
  GH: { name: "Ghana", code: "GH", currency: "GHS", phonePrefix: "+233" },
  NG: { name: "Nigéria", code: "NG", currency: "NGN", phonePrefix: "+234" },
  KE: { name: "Kenya", code: "KE", currency: "KES", phonePrefix: "+254" },
  UG: { name: "Ouganda", code: "UG", currency: "UGX", phonePrefix: "+256" },
  TZ: { name: "Tanzanie", code: "TZ", currency: "TZS", phonePrefix: "+255" },
  RW: { name: "Rwanda", code: "RW", currency: "RWF", phonePrefix: "+250" },
  ZM: { name: "Zambie", code: "ZM", currency: "ZMW", phonePrefix: "+260" },
  CM: { name: "Cameroun", code: "CM", currency: "XAF", phonePrefix: "+237" },
  MA: { name: "Maroc", code: "MA", currency: "MAD", phonePrefix: "+212" },
  TN: { name: "Tunisie", code: "TN", currency: "TND", phonePrefix: "+216" },
  DZ: { name: "Algérie", code: "DZ", currency: "DZD", phonePrefix: "+213" },
};

export const paymentInitSchema = z.object({
  aggregator: z.enum(["flutterwave", "paystack"]),
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

export async function initiateFlutterwavePayment(input: PaymentInitInput, totalAmount: number) {
  const method = AGGREGATORS.flutterwave.methods.find(m => m.id === input.methodId);
  if (!method) throw new Error("Méthode de paiement non trouvée");

  const country = COUNTRY_CODES[input.countryCode];
  if (!country) throw new Error("Pays non supporté");

  const txRef = generateRef("FLW");

  if (FLUTTERWAVE_CONFIG.isDemo) {
    return {
      status: "demo",
      message: "Mode démo - Paiement simulé avec succès",
      transactionId: txRef,
      aggregator: "flutterwave",
      method: method.name,
      amount: totalAmount,
      currency: country.currency,
      phoneNumber: input.phoneNumber,
      instructions: `[DÉMO] Un prompt de paiement serait envoyé au ${input.phoneNumber} via ${method.name}. Composez *150# pour confirmer le paiement de ${totalAmount} ${country.currency}.`,
    };
  }

  const payload: any = {
    tx_ref: txRef,
    amount: totalAmount,
    currency: country.currency,
    email: input.email,
    phone_number: input.phoneNumber,
    fullname: input.fullName,
    redirect_url: `${process.env.REPLIT_DEV_DOMAIN || ""}/payment/callback`,
    meta: {
      consumer_id: input.email,
      items: JSON.stringify(input.items),
    },
  };

  try {
    const response = await fetch(`${FLUTTERWAVE_CONFIG.baseUrl}/charges?type=mobile_money_${input.countryCode.toLowerCase()}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FLUTTERWAVE_CONFIG.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        network: method.network,
        country: input.countryCode,
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return {
        status: "pending",
        message: data.meta?.authorization?.note || `Un prompt de paiement a été envoyé au ${input.phoneNumber}`,
        transactionId: txRef,
        flutterwaveRef: data.data?.flw_ref,
        aggregator: "flutterwave",
        method: method.name,
        amount: totalAmount,
        currency: country.currency,
        instructions: data.meta?.authorization?.note || `Confirmez le paiement sur votre téléphone ${input.phoneNumber}`,
      };
    }

    throw new Error(data.message || "Échec de l'initialisation du paiement");
  } catch (error: any) {
    if (error.message?.includes("fetch")) {
      return {
        status: "demo",
        message: "API Flutterwave indisponible - Mode démo activé",
        transactionId: txRef,
        aggregator: "flutterwave",
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

export async function initiatePaystackPayment(input: PaymentInitInput, totalAmount: number) {
  const method = AGGREGATORS.paystack.methods.find(m => m.id === input.methodId);
  if (!method) throw new Error("Méthode de paiement non trouvée");

  const country = COUNTRY_CODES[input.countryCode];
  if (!country) throw new Error("Pays non supporté");

  const reference = generateRef("PSK");
  const amountInKobo = totalAmount * 100;

  if (PAYSTACK_CONFIG.isDemo) {
    return {
      status: "demo",
      message: "Mode démo - Paiement simulé avec succès",
      transactionId: reference,
      aggregator: "paystack",
      method: method.name,
      amount: totalAmount,
      currency: country.currency,
      phoneNumber: input.phoneNumber,
      instructions: `[DÉMO] Un prompt de paiement serait envoyé au ${input.phoneNumber} via ${method.name}. Entrez votre PIN pour confirmer le paiement de ${totalAmount} ${country.currency}.`,
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/charge`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: amountInKobo,
        currency: country.currency,
        reference,
        mobile_money: {
          phone: input.phoneNumber,
          provider: method.provider,
        },
        metadata: {
          items: JSON.stringify(input.items),
          custom_fields: [
            { display_name: "Nom", variable_name: "fullname", value: input.fullName },
          ],
        },
      }),
    });

    const data = await response.json();

    if (data.status) {
      return {
        status: data.data?.status === "success" ? "success" : "pending",
        message: data.data?.display_text || `Paiement en cours via ${method.name}`,
        transactionId: reference,
        paystackRef: data.data?.reference,
        aggregator: "paystack",
        method: method.name,
        amount: totalAmount,
        currency: country.currency,
        instructions: data.data?.display_text || `Confirmez le paiement sur votre téléphone ${input.phoneNumber}`,
      };
    }

    throw new Error(data.message || "Échec de l'initialisation du paiement");
  } catch (error: any) {
    if (error.message?.includes("fetch")) {
      return {
        status: "demo",
        message: "API Paystack indisponible - Mode démo activé",
        transactionId: reference,
        aggregator: "paystack",
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

export async function verifyFlutterwavePayment(transactionId: string) {
  if (FLUTTERWAVE_CONFIG.isDemo) {
    return { status: "success", verified: true, demo: true };
  }

  try {
    const response = await fetch(`${FLUTTERWAVE_CONFIG.baseUrl}/transactions/${transactionId}/verify`, {
      headers: { "Authorization": `Bearer ${FLUTTERWAVE_CONFIG.secretKey}` },
    });
    const data = await response.json();
    return {
      status: data.data?.status || "unknown",
      verified: data.data?.status === "successful",
      demo: false,
    };
  } catch {
    return { status: "unknown", verified: false, demo: false };
  }
}

export async function verifyPaystackPayment(reference: string) {
  if (PAYSTACK_CONFIG.isDemo) {
    return { status: "success", verified: true, demo: true };
  }

  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${reference}`, {
      headers: { "Authorization": `Bearer ${PAYSTACK_CONFIG.secretKey}` },
    });
    const data = await response.json();
    return {
      status: data.data?.status || "unknown",
      verified: data.data?.status === "success",
      demo: false,
    };
  } catch {
    return { status: "unknown", verified: false, demo: false };
  }
}
