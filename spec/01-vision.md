# Vision Produit

## Problème

Les Maîtres de Jeu (MJ) de jeux de rôle comme D&D ont besoin de :

- Garder une trace des sessions passées
- Prendre des notes privées (secrets, plans futurs)
- Partager des résumés avec leurs joueurs
- Organiser les prochaines sessions

Les joueurs veulent :

- Retrouver facilement ce qui s'est passé
- Voir les notes publiques partagées par le MJ
- Connaître la date de la prochaine session

## Solution : DnD Hub

Une application web permettant de gérer des **campagnes de JDR** avec deux espaces distincts :

### Espace Maître de Jeu (privé)

- Création et gestion des campagnes
- Rédaction des résumés de session
- Notes privées (jamais visibles par les joueurs)
- Notes publiques (partagées après publication)
- Gestion des joueurs (invitations, retraits)
- Planification des prochaines sessions

### Espace Joueur (lecture seule)

- Consultation des résumés publiés
- Accès aux notes publiques
- Vue sur les prochaines sessions planifiées

---

## Personas

### Marie - Maîtresse de Jeu

> "Je veux un endroit unique pour gérer mes 2 campagnes, prendre mes notes secrètes et partager les résumés avec mes joueurs sans avoir à jongler entre Discord, Google Docs et mon carnet."

- Gère 2 campagnes avec 4-5 joueurs chacune
- Prend beaucoup de notes pendant les sessions
- A besoin de séparer notes privées/publiques
- Veut un historique consultable

### Lucas - Joueur

> "Je veux pouvoir relire ce qui s'est passé la dernière fois avant chaque session, sans avoir à chercher dans les messages Discord."

- Participe à 2 campagnes avec différents MJ
- Oublie parfois les détails entre sessions
- Veut un accès simple et rapide

---

## Principes de Design

1. **Séparation claire MJ/Joueur** - Les interfaces sont distinctes selon le rôle
2. **Notes privées sanctuarisées** - Jamais exposées, même par erreur
3. **Publication explicite** - Rien n'est visible par les joueurs avant publication
4. **Simple d'abord** - Pas de fonctionnalités superflues au MVP
5. **Mobile-friendly** - Consultation facile sur téléphone pendant les sessions

---

## Non-objectifs (hors scope MVP)

- Gestion des personnages (fiches, stats, inventaire)
- Système de combat / jets de dés intégré
- Cartes interactives
- Chat en temps réel
- Gestion de règles spécifiques (D&D 5e, Pathfinder, etc.)
