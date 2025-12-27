# DnD Hub - Spécification Projet

> Application de gestion de campagnes de jeux de rôle (D&D et autres) permettant aux Maîtres de Jeu de gérer leurs sessions et aux joueurs de consulter les résumés.

## Navigation

| Document                                       | Description                 |
| ---------------------------------------------- | --------------------------- |
| [01-vision.md](./01-vision.md)                 | Vision produit et objectifs |
| [02-features.md](./02-features.md)             | Fonctionnalités détaillées  |
| [03-data-model.md](./03-data-model.md)         | Modèle de données           |
| [04-architecture.md](./04-architecture.md)     | Architecture technique      |
| [05-open-questions.md](./05-open-questions.md) | Questions en suspens        |

---

## Stack Technique Actuelle

| Couche    | Technologie         | Version |
| --------- | ------------------- | ------- |
| Framework | SvelteKit           | 2.x     |
| UI        | Svelte 5 (runes)    | 5.x     |
| Styling   | Tailwind CSS        | 4.x     |
| ORM       | Drizzle             | 0.45+   |
| Database  | PostgreSQL          | -       |
| Tests     | Vitest + Playwright | -       |
| i18n      | Paraglide           | 2.x     |

---

## Points Critiques à Valider

### 1. Authentification

- [ ] Quelle solution ? (Lucia, Auth.js, custom, OAuth only...)
- [ ] Providers OAuth souhaités ? (Google, Discord, GitHub...)
- [ ] Gestion des comptes locaux (email/password) ?

### 2. Autorisations

- [ ] Système de rôles par campagne (MJ/Joueur)
- [ ] Invitations : par code, par email, ou les deux ?
- [ ] Un utilisateur peut-il être MJ sur une campagne et joueur sur une autre ?

### 3. Fonctionnalités Audio (mentionnées dans le mockup)

- [ ] Transcription audio des sessions : MVP ou future ?
- [ ] Si oui : service externe (Whisper API, AssemblyAI) ou self-hosted ?

### 4. Temps Réel

- [ ] Notifications en temps réel nécessaires ?
- [ ] Mise à jour live des sessions pendant l'édition ?

### 5. Déploiement

- [ ] Cible : VPS, Docker, Vercel, autre ?
- [ ] Contraintes de coût/performance ?

---

## Prochaines Étapes

1. **Valider la vision** → Revoir [01-vision.md](./01-vision.md)
2. **Prioriser les features** → Définir le MVP dans [02-features.md](./02-features.md)
3. **Trancher les questions** → Compléter [05-open-questions.md](./05-open-questions.md)
4. **Finaliser le data model** → Valider [03-data-model.md](./03-data-model.md)
5. **Démarrer l'implémentation** → Créer les tâches

---

## Origine

Cette spécification est basée sur l'analyse du mockup React situé dans `/mockup/`.
Le mockup démontre les interfaces utilisateur et les flux principaux.
