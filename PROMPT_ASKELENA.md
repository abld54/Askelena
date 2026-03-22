# Prompt Askelena — Session Claude Code (dangerously-skip-permissions)

## Commande de lancement

```bash
cd /home/iamsupersocks/askelena && claude --dangerously-skip-permissions
```

## Prompt à coller

```
Tu es le lead developer du projet Askelena. Tu travailles dans /home/iamsupersocks/askelena (repo git: github.com/Askelena/askelena, déjà cloné, vide).

## Le projet

Askelena est une plateforme type Airbnb spécialisée dans la location de **péniches** et **lieux d'exception** (châteaux, phares, cabanes, yourtes, tiny houses, etc.).

## Stack technique

- **Frontend** : Next.js 15 (App Router) + TypeScript strict + TailwindCSS + shadcn/ui
- **Backend** : Next.js API Routes (Route Handlers)
- **ORM** : Prisma
- **Base de données** : PostgreSQL (déjà dispo sur localhost:54329, user=paperclip, pass=paperclip, db=askelena — à créer)
- **Auth** : NextAuth.js v5 (credentials + Google OAuth)
- **Paiement** : Stripe Checkout + Webhooks
- **Upload images** : stockage local ou S3-compatible
- **Carte** : Leaflet (OpenStreetMap) — pas de clé API nécessaire
- **Design** : palette bleu marine (#1e3a5f) / doré (#c9a84c) / blanc. Ambiance premium, nature, escapade.

## Schéma de données (Prisma)

- **User** : id, name, email, password, image, role (GUEST | HOST | ADMIN), createdAt
- **Listing** : id, title, description, type (PENICHE | CHATEAU | PHARE | CABANE | YOURTE | TINY_HOUSE | AUTRE), address, city, region, country, lat, lng, pricePerNight, capacity, bedrooms, bathrooms, amenities (JSON), hostId, createdAt
- **Image** : id, url, listingId
- **Booking** : id, startDate, endDate, totalPrice, status (PENDING | CONFIRMED | CANCELLED | COMPLETED), guestId, listingId, stripeSessionId, createdAt
- **Review** : id, rating (1-5), comment, guestId, listingId, createdAt

## Pages à créer

1. **/** — Landing page : hero avec barre de recherche, catégories cliquables, listings populaires, CTA
2. **/listings** — Résultats de recherche avec filtres (type, lieu, dates, prix, capacité) + vue carte
3. **/listings/[id]** — Page détail : galerie photos, description, équipements, carte, calendrier dispo, bouton réserver, avis
4. **/auth/login** et **/auth/register** — Pages d'authentification
5. **/dashboard** — Dashboard hôte : mes annonces, mes réservations reçues, stats
6. **/dashboard/listings/new** — Formulaire création annonce
7. **/dashboard/listings/[id]/edit** — Édition annonce
8. **/bookings** — Mes réservations (côté guest)
9. **/profile** — Profil utilisateur

## Paperclip (orchestration agents IA)

Le projet est suivi dans Paperclip (serveur local, API sur http://localhost:3100).
Mode : local_trusted (pas besoin d'auth pour l'API).

### IDs importants
- Company: 31deeb52-27cd-43ff-8d2e-f10a2701a1bf
- Projet Askelena: afa34d36-29b2-43db-9f43-39fcd48e1647
- Goal: 7ffc1885-8941-49d4-b59f-b31d2e1a37fa

### Agents
- CEO: 0dc81947-df87-4936-b9c6-6a1fc48f1a68
- Founding Engineer: 4b4ba4fc-f607-4ff6-afa4-17880f346cbd
- Coder: 55941ee1-d287-4ce9-a9d4-cd32c5ee28e5
- Marketing Designer: de974f55-7dc2-4b13-a30c-8030a01d024e

### Issues Askelena
- SUP-15 (4aa9f122): Init projet Next.js — Founding Engineer — critical
- SUP-16 (a023c5c7): Schema Prisma — Founding Engineer — critical
- SUP-9 (08545faa): Landing page + design system — Marketing Designer — high
- SUP-10 (c93cea99): Auth NextAuth.js — Coder — high
- SUP-11 (30a5ba42): CRUD Listings — Coder — high
- SUP-12 (56886ee0): Recherche + filtres + carte — Coder — medium
- SUP-13 (83beba98): Réservation + Stripe — Founding Engineer — medium
- SUP-14 (71fa90b7): Avis et notes — Coder — low

### API Paperclip utile
```bash
# Lister les issues du projet
curl -s "http://localhost:3100/api/companies/31deeb52-27cd-43ff-8d2e-f10a2701a1bf/issues"

# Mettre à jour le statut d'une issue
curl -s -X PATCH "http://localhost:3100/api/issues/{issueId}" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'  # ou "done"

# Ajouter un commentaire
curl -s -X POST "http://localhost:3100/api/issues/{issueId}/comments" \
  -H "Content-Type: application/json" \
  -d '{"body": "Texte du commentaire"}'

# Créer une nouvelle issue
curl -s -X POST "http://localhost:3100/api/companies/31deeb52-27cd-43ff-8d2e-f10a2701a1bf/issues" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"afa34d36-29b2-43db-9f43-39fcd48e1647","goalId":"7ffc1885-8941-49d4-b59f-b31d2e1a37fa","title":"...","description":"...","status":"todo","priority":"medium","assigneeAgentId":"..."}'
```

## Instructions

1. Commence par SUP-15 : initialise le projet Next.js dans le dossier courant (qui est déjà un repo git). Crée la DB askelena dans PostgreSQL.
2. Enchaîne avec SUP-16 : crée le schema Prisma complet et lance la migration.
3. Continue avec les issues par ordre de priorité (critical → high → medium → low).
4. À chaque fois que tu commences une issue, mets son statut à "in_progress" via l'API Paperclip. Quand tu la termines, mets-la à "done".
5. Commit et push régulièrement sur github.com/Askelena/askelena (remote origin déjà configuré).
6. Utilise des agents en parallèle quand c'est possible pour aller plus vite.
7. Le site doit être beau, responsive, et fonctionnel. Ambiance premium/nature.
8. Ajoute des données seed (faker) pour avoir du contenu de démo : 10-15 listings avec des descriptions réalistes de péniches, châteaux, phares, etc.
```
