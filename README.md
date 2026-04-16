# Ghost Business — Terminal de repreneuriat au Québec

Plateforme SaaS qui connecte propriétaires de PME québécoises (vendeurs) avec
repreneurs et investisseurs qualifiés (acheteurs), dans un environnement anonyme,
sécurisé et haut de gamme.

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | Next.js 14 (App Router) | Pages, Server Components, Server Actions |
| Styling | Tailwind CSS | Design system Ghost Business |
| Backend | Supabase | Auth, PostgreSQL, Realtime, Storage |
| Temps réel | Supabase Realtime | Messagerie live, notifications |
| Typage | TypeScript strict | Sécurité bout-en-bout |
| Formulaires | React Hook Form + Zod | Validation client + serveur |
| Animations | Framer Motion | Transitions fluides |

---

## Architecture des dossiers

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          ← Connexion
│   │   ├── signup/page.tsx         ← Inscription
│   │   └── onboarding/page.tsx     ← Choix du profil (acheteur/vendeur)
│   ├── dashboard/
│   │   ├── layout.tsx              ← Layout protégé avec sidebar
│   │   ├── acheteur/
│   │   │   ├── page.tsx            ← Feed des deals (Focus + Portfolio)
│   │   │   └── pipeline/page.tsx   ← Vue CRM Pipeline
│   │   ├── vendeur/
│   │   │   ├── page.tsx            ← Tableau de bord vendeur
│   │   │   ├── dossier/
│   │   │   │   └── nouveau/page.tsx ← Création dossier 4 étapes
│   │   │   ├── dataroom/page.tsx   ← Coffre-fort documents
│   │   │   └── matches/page.tsx    ← Gestion des intérêts reçus
│   │   ├── messagerie/
│   │   │   ├── page.tsx            ← Inbox toutes conversations
│   │   │   └── [matchId]/page.tsx  ← Thread individuel
│   │   ├── marketplace/page.tsx    ← Services partenaires
│   │   └── settings/page.tsx       ← Paramètres compte
│   └── api/
│       ├── auth/callback/route.ts  ← OAuth callback Supabase
│       └── webhooks/stripe/route.ts ← Stripe webhooks (Phase 2)
├── components/
│   ├── deals/
│   │   ├── DealCard.tsx            ← Carte deal acheteur
│   │   ├── DealFeed.tsx            ← Liste filtrée deals
│   │   └── LoanSimulator.tsx       ← Simulateur prêt bancaire
│   ├── messaging/
│   │   ├── SecureThread.tsx        ← Interface messagerie complète
│   │   ├── MessageBubble.tsx       ← Bulle message individuelle
│   │   └── OfferPanel.tsx          ← Panneau d'offre structurée
│   ├── layout/
│   │   ├── SidebarNav.tsx          ← Navigation latérale
│   │   └── TopBar.tsx              ← Barre du haut mobile
│   └── ui/                         ← Composants réutilisables
│       ├── Badge.tsx
│       ├── ScoreRing.tsx
│       ├── DataBar.tsx
│       └── StatCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Client browser
│   │   └── server.ts               ← Client serveur (Server Components)
│   ├── actions.ts                  ← Toutes les Server Actions
│   ├── hooks/
│   │   └── useMessages.ts          ← Messagerie temps réel
│   └── utils/
│       └── index.ts                ← Ghost Score, formatCAD, helpers
├── types/
│   └── index.ts                    ← Tous les types TypeScript
└── styles/
    └── globals.css                 ← Design tokens + classes Tailwind
```

---

## Installation locale

### 1. Cloner et installer

```bash
git clone https://github.com/votre-compte/ghost-business
cd ghost-business
npm install
```

### 2. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → New Project
2. Nommer le projet `ghost-business`
3. Choisir la région `ca-central-1` (Canada — important pour la conformité Québec)
4. Copier l'URL et les clés API

### 3. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
# Remplir les valeurs Supabase dans .env.local
```

### 4. Appliquer le schéma de base de données

```bash
# Option A — via l'interface Supabase (recommandé pour commencer)
# Copier le contenu de supabase/migrations/001_initial_schema.sql
# Le coller dans Supabase Dashboard → SQL Editor → Run

# Option B — via Supabase CLI
npm install -g supabase
supabase login
supabase link --project-ref votre-project-ref
supabase db push
```

### 5. Configurer l'authentification Supabase

Dans Supabase Dashboard → Authentication → URL Configuration :
- Site URL : `http://localhost:3000`
- Redirect URLs : `http://localhost:3000/auth/callback`

### 6. Lancer le serveur de développement

```bash
npm run dev
# → http://localhost:3000
```

---

## Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Variables d'environnement — les ajouter dans Vercel Dashboard
# ou via CLI :
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Mettre à jour Supabase → Authentication → URL Configuration avec l'URL Vercel de production.

---

## Modèle de données — Schéma simplifié

```
profiles          → Utilisateurs (acheteur ou vendeur)
    ↓
deals             → Dossiers publiés par les vendeurs
    ↓
matches           → Intérêts exprimés par les acheteurs
    ↓ (NDA → Data Room → Due Diligence → Offre → Closing)
messages          → Messagerie sécurisée post-match
    ↓
data_room_documents → Documents déposés par le vendeur
notifications     → Alertes temps réel
```

### Sécurité Row Level Security (RLS)

Toutes les tables ont RLS activé. Les règles clés :

- **deals** : les acheteurs ne voient que les champs publics (EBITDA, secteur, région). `company_name` et `address` sont masqués jusqu'à la révélation mutuelle.
- **matches** : visibles uniquement par l'acheteur et le vendeur concernés.
- **messages** : accessibles uniquement aux participants du match.
- **data_room_documents** : accessibles uniquement après NDA signé par l'acheteur.

---

## Roadmap Phase 2

- [ ] Intégration Stripe — abonnements Standard (149$/mois) et Premium (499$/mois)
- [ ] Emails transactionnels via Resend (NDA signé, match accepté, nouvelle offre)
- [ ] Signature NDA électronique via DocuSign ou Notarize
- [ ] Application mobile React Native (partage de la logique business)
- [ ] Ghost Score IA avancé via OpenAI (analyse de la description + secteur)
- [ ] Vérification NEQ automatique via API du Registraire des entreprises du Québec
- [ ] Marketplace de services partenaires (comptables, avocats, BDC)
- [ ] Tableau de bord analytics vendeur avancé

---

## Sécurité & conformité

- Authentification via Supabase Auth (JWT, sessions sécurisées)
- Row Level Security sur toutes les tables — aucune donnée sensible exposée côté client
- Chiffrement en transit (HTTPS) et au repos (Supabase)
- Aucun numéro de téléphone ni courriel partageable avant closing
- Données hébergées au Canada (`ca-central-1`) pour conformité Québec/LPRPDE
- NDA signé avant tout accès à la Data Room

---

## Licence

Propriétaire — Ghost Business Inc. © 2026
