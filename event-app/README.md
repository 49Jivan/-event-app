# EventApp — Gestion d'événements & réservation de tickets

Application simple permettant à un utilisateur de se connecter, de choisir un
événement parmi ceux disponibles, et de réserver un ticket. Un espace admin
permet de créer/gérer les événements.

Structure conforme au standard de déploiement LRPC (racine = backend,
`frontend/` = Next.js, `ecosystem-*.config.js`, `devops/nginx.conf`, `.env`).

## Stack

- **Backend** : Node.js + Express + MySQL (`mysql2`), auth par JWT
- **Frontend** : Next.js (pages router), React, CSS simple sans framework
- **Base de données** : MySQL (schéma dans `src/db/schema.sql`)

## Structure du projet

```
.
├── server.js                     # point d'entrée backend
├── src/
│   ├── app.js                    # config Express + montage des routes
│   ├── db/
│   │   ├── pool.js               # pool de connexion MySQL
│   │   ├── schema.sql            # tables users / events / bookings
│   │   ├── init.js               # applique schema.sql sur la DB
│   │   └── make-admin.js         # promeut un utilisateur en admin
│   ├── middleware/auth.js        # verifyToken / requireAdmin
│   └── routes/
│       ├── auth.js               # /api/auth/register, /login
│       ├── events.js             # /api/events (liste, detail, CRUD admin)
│       └── bookings.js           # /api/bookings (reserver, mes tickets, annuler)
├── frontend/
│   ├── pages/
│   │   ├── index.js              # liste des evenements
│   │   ├── login.js / register.js
│   │   ├── my-tickets.js         # tickets de l'utilisateur connecte
│   │   ├── events/[id].js        # detail + reservation
│   │   └── admin/events.js       # creation/suppression d'evenements (admin)
│   ├── context/AuthContext.js    # session utilisateur (localStorage)
│   ├── lib/api.js                # appels vers le backend
│   └── styles/globals.css
├── ecosystem-backend.config.js
├── ecosystem-frontend.config.js
└── devops/nginx.conf
```

## Setup local

### 1. Backend

```bash
npm install
cp .env.example .env   # puis renseigner DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET
npm run db:init         # cree les tables users / events / bookings
npm run dev              # demarre le backend sur PORT (3047 par defaut)
```

Pour transformer un utilisateur en admin (après inscription classique) :

```bash
npm run make-admin -- ton-email@exemple.com
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL doit pointer vers le backend
npm run dev                   # demarre sur http://localhost:3000
```

## Flux fonctionnel

1. Un visiteur s'inscrit (`/register`) ou se connecte (`/login`)
2. Il consulte la liste des événements (`/`) et le détail de l'un d'eux
3. Il réserve un ticket (une seule réservation active par utilisateur et par
   événement, places limitées par la capacité définie)
4. Il retrouve ses tickets sur `/my-tickets` et peut les annuler
5. Un compte admin gère les événements sur `/admin/events`

## Déploiement (standard LRPC)

Ce projet suit le guide de déploiement LRPC fourni : deux jobs Jenkins
(CI sans accès aux secrets, CD avec le `.env` de production injecté via un
credential *Secret file*), PM2 pour faire tourner les deux apps
(`ecosystem-backend.config.js` / `ecosystem-frontend.config.js`), et Nginx
pour router `event-app.exemple.com` vers le frontend et
`api.event-app.exemple.com` vers le backend (`devops/nginx.conf`, à adapter
avec les vrais noms de domaine).

⚠️ Avant tout déploiement : remplacer `JWT_SECRET` par une vraie valeur secrète
et ne jamais committer le fichier `.env`.
