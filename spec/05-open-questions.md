# Questions en Suspens

Ce document liste toutes les décisions à prendre avant de démarrer l'implémentation.

> 📋 Voir [00-functional-flow.md](./00-functional-flow.md) pour le schéma fonctionnel complet.

---

## 1. Authentification

### Q1.1 : Quelle librairie d'authentification ?

| Option          | Pour                     | Contre                  |
| --------------- | ------------------------ | ----------------------- |
| **Lucia**       | Léger, flexible, bon DX  | Single maintainer       |
| **Better Auth** | Moderne, SvelteKit-first | Moins mature            |
| **Auth.js**     | Providers OAuth inclus   | Config complexe         |
| **Custom**      | Contrôle total           | Risques sécurité, temps |

**Décision :** ✅ **Better Auth** (confirmé par schéma fonctionnel)

---

### Q1.2 : Quels providers OAuth ?

- [x] Email/Password (local) ✅ Confirmé
- [ ] Google
- [x] Discord (populaire pour JDR) ✅
- [ ] GitHub
- [ ] Autres : \***\*\_\_\_\*\***

**Décision :** ✅ **Email/Password + Discord**

---

### Q1.3 : Email/Password requis pour le MVP ?

Si non, on peut démarrer avec OAuth uniquement et ajouter email/password plus tard.

**Décision :** ✅ **Oui, Email/Password pour le MVP**

---

### Q1.2 : Quels providers OAuth ?

- [ ] Email/Password (local)
- [ ] Google
- [ ] Discord (populaire pour JDR)
- [ ] GitHub
- [ ] Autres : \***\*\_\_\_\*\***

**Décision :** `[ À trancher ]`

---

### Q1.3 : Email/Password requis pour le MVP ?

Si non, on peut démarrer avec OAuth uniquement et ajouter email/password plus tard.

**Décision :** `[ À trancher ]`

---

## 2. Interface Utilisateur

### Q2.1 : Librairie de composants UI ?

| Option            | Pour                                  | Contre                     |
| ----------------- | ------------------------------------- | -------------------------- |
| **shadcn-svelte** | Populaire, accessible, customisable   | Dépendance bits-ui         |
| **Skeleton**      | Complet, theming                      | Plus lourd                 |
| **Melt UI**       | Headless, flexible                    | Plus de travail de styling |
| **DaisyUI**       | Léger, thèmes inclus, Tailwind-native | Moins customisable         |
| **Custom**        | Pas de dépendance                     | Temps de développement     |

**Décision :** ✅ **DaisyUI** - Thèmes dark/light inclus, intégration Tailwind native

---

### Q2.2 : Éditeur de texte pour les notes ?

| Option                  | Pour                | Contre              |
| ----------------------- | ------------------- | ------------------- |
| **Textarea + Markdown** | Simple, léger       | Moins user-friendly |
| **TipTap**              | WYSIWYG, extensible | Plus lourd          |
| **Milkdown**            | Markdown + WYSIWYG  | Setup complexe      |

**Décision :** ✅ **Markdown** - Simple textarea avec rendu Markdown

---

### Q2.3 : Mode sombre ?

- [x] Oui, dès le MVP ✅
- [ ] V2
- [ ] Non prévu

**Décision :** ✅ **MVP** - Automatique via DaisyUI themes

---

### Q2.2 : Éditeur de texte pour les notes ?

| Option                  | Pour                | Contre              |
| ----------------------- | ------------------- | ------------------- |
| **Textarea + Markdown** | Simple, léger       | Moins user-friendly |
| **TipTap**              | WYSIWYG, extensible | Plus lourd          |
| **Milkdown**            | Markdown + WYSIWYG  | Setup complexe      |

**Décision :** `[ À trancher ]`

---

### Q2.3 : Mode sombre ?

- [ ] Oui, dès le MVP
- [ ] V2
- [ ] Non prévu

**Décision :** `[ À trancher ]`

---

## 3. Fonctionnalités MVP

### Q3.1 : Calendrier des sessions dans le MVP ?

Le mockup montre un calendrier mais c'est peut-être superflu pour le MVP.

- [x] Oui, inclus dans le MVP ✅
- [ ] Non, V2

**Décision :** ✅ **MVP** - Calendrier inclus

---

### Q3.2 : Invitation par email dans le MVP ?

Ou uniquement par code d'invitation ?

- [x] Email + Code ✅ Confirmé par schéma
- [ ] Code uniquement (MVP)

**Décision :** ✅ **Les deux** (email ou code)

---

### Q3.3 : Transcription audio ?

- [x] MVP ✅
- [ ] V2
- [ ] Pas prévu

Si oui, quel service ?

- [ ] OpenAI Whisper API
- [ ] AssemblyAI
- [ ] Self-hosted Whisper
- [ ] Autre : \***\*\_\_\_\*\***

**Décision :** ✅ **MVP** - Transcription + Génération résumé IA

---

## 4. Données

### Q4.1 : Soft delete ou hard delete ?

- [x] Soft delete (colonne `deletedAt`) ✅
- [ ] Hard delete

**Décision :** ✅ **Soft delete** - Permet récupération des données

---

### Q4.2 : Historique des modifications ?

Tracer les changements sur les sessions (qui a modifié quoi, quand) ?

- [ ] Oui
- [x] Non (MVP) ✅
- [ ] V2

**Décision :** ✅ **Non pour le MVP** - À considérer en V2

---

## 5. Déploiement

### Q5.1 : Environnement cible ?

- [x] VPS + Docker (contrôle total) ✅
- [ ] Vercel + DB managée (moins de maintenance)
- [ ] Railway / Render
- [ ] Autre : \***\*\_\_\_\*\***

**Décision :** ✅ **VPS + Docker**

---

### Q5.2 : Base de données managée ou self-hosted ?

- [x] Self-hosted (Docker) ✅
- [ ] Neon
- [ ] Supabase
- [ ] Railway Postgres
- [ ] Autre : \***\*\_\_\_\*\***

**Décision :** ✅ **Self-hosted via Docker**

---

## 6. Internationalisation

### Q6.1 : Langues supportées au MVP ?

- [ ] Français uniquement
- [x] Français + Anglais ✅
- [ ] Anglais uniquement

Paraglide est déjà configuré, donc ajouter des langues est simple.

**Décision :** ✅ **Français + Anglais**

---

## 7. Validation

### Q7.1 : Librairie de validation ?

| Option      | Pour                       | Contre          |
| ----------- | -------------------------- | --------------- |
| **Zod**     | Standard, écosystème large | Bundle size     |
| **Valibot** | Très léger                 | Moins populaire |
| **Native**  | Pas de dépendance          | Plus verbeux    |

**Décision :** ✅ **Zod**

---

## Résumé des Décisions

Une fois les décisions prises, les reporter ici :

| Question                 | Décision                           | Date       |
| ------------------------ | ---------------------------------- | ---------- |
| Q1.1 Auth lib            | ✅ Better Auth                     | Via schéma |
| Q1.2 OAuth providers     | ✅ Email/Password + Discord        | Confirmé   |
| Q1.3 Email/Password MVP  | ✅ Oui                             | Via schéma |
| Q2.1 UI lib              | ✅ DaisyUI                         | Confirmé   |
| Q2.2 Éditeur texte       | ✅ Markdown                        | Confirmé   |
| Q2.3 Dark mode           | ✅ MVP (via DaisyUI)               | Confirmé   |
| Q3.1 Calendrier MVP      | ✅ Oui                             | Confirmé   |
| Q3.2 Invitation email    | ✅ Email + Code                    | Via schéma |
| Q3.3 Transcription audio | ✅ MVP (transcription + résumé IA) | Confirmé   |
| Q4.1 Soft/Hard delete    | ✅ Soft delete                     | Confirmé   |
| Q4.2 Historique modifs   | ✅ Non (MVP), V2                   | Confirmé   |
| Q5.1 Déploiement         | ✅ VPS + Docker                    | Confirmé   |
| Q5.2 DB managée          | ✅ Self-hosted Docker              | Confirmé   |
| Q6.1 Langues             | ✅ FR + EN                         | Confirmé   |
| Q7.1 Validation lib      | ✅ Zod                             | Confirmé   |

### Nouvelles fonctionnalités identifiées (via schéma)

| Fonctionnalité                                 | Priorité |
| ---------------------------------------------- | -------- |
| Notes perso joueur ("Préparer Roleplay")       | ✅ MVP   |
| Notifications email (nouveau résumé)           | V2       |
| Génération résumé IA                           | ✅ MVP   |
| Transcription audio IA                         | ✅ MVP   |
| Préparation session MJ (Notes, Plans, Secrets) | ✅ MVP   |
