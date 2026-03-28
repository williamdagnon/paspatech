# Intégration FedaPay - Guide de Configuration

## Vue d'ensemble

FedaPay est maintenant l'agrégateur de paiement principal pour African Money Hub. Il prend en charge les paiements mobile money et par carte bancaire dans plusieurs pays d'Afrique de l'Ouest.

**Note importante :** Cette intégration utilise le SDK officiel FedaPay pour Node.js (`fedapay@1.2.5`), qui simplifie considérablement les appels API et améliore la fiabilité.

## Installation du SDK

Le SDK officiel est déjà installé dans le projet :

```bash
npm install fedapay --save
```

## Configuration automatique

Le SDK se configure automatiquement dans `server/payment.ts` :

```typescript
import { FedaPay, Transaction, Customer } from "fedapay";

// Configuration automatique via les variables d'environnement
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
FedaPay.setEnvironment(process.env.FEDAPAY_SECRET_KEY?.includes("sandbox") ? "sandbox" : "live");
```

## Avantages du SDK officiel

- **Fiabilité accrue** : Gestion automatique des erreurs et des timeouts
- **Sécurité** : Authentification et chiffrement gérés automatiquement
- **Maintenance simplifiée** : Mises à jour automatiques des API
- **Code plus propre** : Pas besoin de gérer manuellement les appels HTTP
- **Support officiel** : Compatible avec toutes les fonctionnalités FedaPay

## Pays et méthodes supportés

### Sénégal
- Orange Money
- Wave
- Free Cash
- Carte bancaire

### Côte d'Ivoire
- Orange Money
- Moov Money
- Wave
- Carte bancaire

### Mali
- Orange Money
- Carte bancaire

### Burkina Faso
- Orange Money
- Moov Money
- Carte bancaire

## Configuration des clés API

### 1. Créer un compte FedaPay

1. Rendez-vous sur [https://fedapay.com](https://fedapay.com)
2. Créez un compte (mode sandbox pour les tests)
3. Accédez à votre tableau de bord développeur

### 2. Récupérer les clés API

Dans votre tableau de bord FedaPay :
- **Clé publique** : Utilisée côté client pour les paiements par carte
- **Clé secrète** : Utilisée côté serveur pour les appels API

### 3. Configuration des variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# FedaPay Configuration
FEDAPAY_PUBLIC_KEY=pk_sandbox_VOTRE_CLE_PUBLIQUE_ICI
FEDAPAY_SECRET_KEY=sk_sandbox_VOTRE_CLE_SECRETE_ICI
```

> **⚠️ Important** : Remplacez les clés sandbox par les clés de production une fois prêt pour le live.

## Mode de fonctionnement

### Paiements Mobile Money
1. L'utilisateur sélectionne son opérateur mobile money
2. FedaPay envoie un prompt de paiement sur le téléphone
3. L'utilisateur confirme le paiement via USSD (*144# ou équivalent)
4. Le paiement est traité et confirmé automatiquement

### Paiements par carte
1. L'utilisateur est redirigé vers la page de paiement sécurisée FedaPay
2. Saisie des informations de carte
3. Validation et traitement du paiement
4. Retour automatique vers l'application

## Test en mode sandbox

En mode sandbox (clés commençant par `pk_sandbox_` et `sk_sandbox_`), tous les paiements sont simulés :
- Aucun argent réel n'est débité
- Les transactions apparaissent comme réussies
- Idéal pour tester l'intégration

## Passage en production

1. Remplacez les clés sandbox par les clés de production
2. Testez avec de vrais paiements (montants faibles)
3. Vérifiez que les webhooks fonctionnent correctement
4. Configurez les URLs de callback dans le tableau de bord FedaPay

## Support et documentation

- **Documentation officielle** : [https://docs.fedapay.com](https://docs.fedapay.com)
- **Support FedaPay** : Contactez leur équipe support
- **API Reference** : [https://docs.fedapay.com/api-reference](https://docs.fedapay.com/api-reference)

## Gestion des erreurs

Le SDK officiel gère automatiquement la plupart des erreurs courantes :

- **Erreurs réseau** : Retry automatique avec backoff
- **Erreurs d'authentification** : Messages d'erreur clairs
- **Erreurs de validation** : Validation côté client avant envoi
- **Timeouts** : Gestion automatique des délais d'attente

### Codes d'erreur courants (gérés automatiquement)

- `INVALID_API_KEY` : Clé API incorrecte
- `INSUFFICIENT_BALANCE` : Solde insuffisant (mobile money)
- `TRANSACTION_FAILED` : Échec de transaction
- `INVALID_PHONE_NUMBER` : Numéro de téléphone invalide

## Sécurité

- Les clés API sont stockées de manière sécurisée côté serveur
- Toutes les communications utilisent HTTPS
- Les données sensibles sont chiffrées
- Conformité PCI DSS pour les paiements par carte