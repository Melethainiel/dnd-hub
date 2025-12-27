# Fonctionnalités

## Légende Priorités

| Tag      | Signification                 |
| -------- | ----------------------------- |
| `MVP`    | Indispensable pour la v1      |
| `V2`     | Après le MVP                  |
| `FUTURE` | Nice-to-have, pas prioritaire |

---

## Authentification

### `MVP` Connexion utilisateur

- Inscription / Connexion
- Persistance de session
- Déconnexion

### `MVP` Protection des routes

- Routes protégées nécessitant authentification
- Redirection vers login si non connecté

### `V2` OAuth Providers

- Connexion via Google
- Connexion via Discord (populaire dans la communauté JDR)

---

## Campagnes

### `MVP` Création de campagne

- Nom de la campagne
- Description
- Univers (texte libre : "Faerûn", "Eberron", "Homebrew"...)
- Le créateur devient automatiquement MJ

### `MVP` Liste des campagnes

- Dashboard avec toutes les campagnes de l'utilisateur
- Distinction visuelle : campagnes en tant que MJ vs Joueur
- Accès rapide à chaque campagne

### `MVP` Détail campagne

- Affichage des informations de base
- Liste des sessions
- Liste des joueurs (vue MJ)

### `V2` Édition de campagne

- Modification nom/description/univers
- Archivage de campagne

### `V2` Suppression de campagne

- Soft delete avec confirmation
- Uniquement par le MJ

---

## Sessions

### `MVP` Création de session

- Numéro de session (auto-incrémenté ou manuel)
- Date de la session
- Résumé (texte riche ou markdown)
- Notes privées (MJ only)
- Notes publiques (visibles après publication)

### `MVP` Édition de session

- Modification de tous les champs
- Mise à jour du statut de publication

### `MVP` Publication de session

- Toggle pour rendre visible aux joueurs
- Les notes privées restent toujours cachées

### `MVP` Liste des sessions (MJ)

- Toutes les sessions, publiées ou non
- Accès aux notes privées

### `MVP` Liste des sessions (Joueur)

- Uniquement les sessions publiées
- Pas d'accès aux notes privées

### `V2` Suppression de session

- Soft delete avec confirmation

### `MVP` Planification prochaine session

- Date prévue
- Thème / Ce qu'il faut préparer

### `MVP` Transcription audio

- Upload d'un fichier audio (MP3, WAV, M4A)
- Transcription automatique via IA (Whisper API ou équivalent)
- Texte éditable après transcription

### `MVP` Génération de résumé IA

- À partir des notes manuelles ou de la transcription
- Extraction des événements clés
- Résumé éditable par le MJ avant publication

---

## Gestion des Joueurs

### `MVP` Invitation par code

- Génération d'un code unique par campagne
- Le joueur rejoint en entrant le code

### `MVP` Liste des joueurs

- Vue des joueurs d'une campagne (MJ only)
- Date d'arrivée

### `MVP` Retrait d'un joueur

- Le MJ peut retirer un joueur
- Le joueur peut quitter une campagne

### `MVP` Invitation par email

- Envoi d'email d'invitation
- Lien direct pour rejoindre

### `MVP` Rôles multiples

- Un utilisateur peut être MJ sur une campagne et joueur sur une autre
- Gestion des permissions par campagne

---

## Espace Joueur

### `MVP` Notes personnelles joueur

- Chaque joueur peut prendre des notes privées sur une session
- Notes visibles uniquement par le joueur lui-même
- Préparer son roleplay, noter ses réflexions

---

## Dashboard

### `MVP` Vue d'ensemble

- Campagnes en tant que MJ
- Campagnes en tant que Joueur
- Prochaines sessions à venir

### `MVP` Calendrier

- Vue calendrier des sessions passées et futures
- Navigation par mois

### `V2` Notifications

- Rappels de sessions à venir
- Notification quand une session est publiée

---

## Profil Utilisateur

### `MVP` Informations de base

- Nom d'affichage
- Email

### `V2` Paramètres

- Changement de mot de passe
- Préférences de notification
- Thème clair/sombre
