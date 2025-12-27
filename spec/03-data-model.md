# Modèle de Données

## Diagramme Entités-Relations

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │ CampaignMember  │       │  Campaign   │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)         │    ┌──│ id (PK)     │
│ email       │  │    │ userId (FK)     │────┘  │ name        │
│ name        │  └───▶│ campaignId (FK) │◀──────│ description │
│ password?   │       │ role            │       │ universe    │
│ createdAt   │       │ joinedAt        │       │ inviteCode  │
│ updatedAt   │       └─────────────────┘       │ createdAt   │
│ deletedAt   │                                 │ updatedAt   │
└─────────────┘                                 │ deletedAt   │
       │                                        └──────┬──────┘
       │                                               │
       │                                               │ 1:N
       │                                               ▼
       │                                        ┌─────────────┐
       │                                        │   Session   │
       │                                        ├─────────────┤
       │                                        │ id (PK)     │
       │                                        │ campaignId  │
       │                                        │ number      │
       │                                        │ sessionDate │
       │                                        │ summary     │
       │                                        │ privateNotes│
       │                                        │ publicNotes │
       │                                        │ audioUrl?   │
       │                                        │ transcript? │
       │                                        │ isPublished │
       │                                        │ nextDate?   │
       │                                        │ nextTheme?  │
       │                                        │ createdAt   │
       │                                        │ updatedAt   │
       │                                        │ deletedAt   │
       │                                        └──────┬──────┘
       │                                               │
       │         ┌─────────────────────────────────────┘
       │         │
       │         ▼
       │  ┌──────────────────┐
       └─▶│   PlayerNote     │
          ├──────────────────┤
          │ id (PK)          │
          │ sessionId (FK)   │
          │ userId (FK)      │
          │ content          │
          │ createdAt        │
          │ updatedAt        │
          └──────────────────┘
```

---

## Tables

### User

| Colonne      | Type         | Contraintes           | Description                          |
| ------------ | ------------ | --------------------- | ------------------------------------ |
| id           | UUID         | PK                    | Identifiant unique                   |
| email        | VARCHAR(255) | UNIQUE, NOT NULL      | Email de l'utilisateur               |
| name         | VARCHAR(100) | NOT NULL              | Nom d'affichage                      |
| passwordHash | VARCHAR(255) | NULL                  | Hash du mot de passe (null si OAuth) |
| createdAt    | TIMESTAMP    | NOT NULL, DEFAULT NOW | Date de création                     |
| updatedAt    | TIMESTAMP    | NOT NULL              | Date de modification                 |
| deletedAt    | TIMESTAMP    | NULL                  | Date de suppression (soft delete)    |

**Index:** `email`

---

### Campaign

| Colonne     | Type         | Contraintes           | Description                       |
| ----------- | ------------ | --------------------- | --------------------------------- |
| id          | UUID         | PK                    | Identifiant unique                |
| name        | VARCHAR(200) | NOT NULL              | Nom de la campagne                |
| description | TEXT         | NULL                  | Description de la campagne        |
| universe    | VARCHAR(100) | NULL                  | Univers de jeu                    |
| inviteCode  | VARCHAR(8)   | UNIQUE, NOT NULL      | Code d'invitation                 |
| createdAt   | TIMESTAMP    | NOT NULL, DEFAULT NOW | Date de création                  |
| updatedAt   | TIMESTAMP    | NOT NULL              | Date de modification              |
| deletedAt   | TIMESTAMP    | NULL                  | Date de suppression (soft delete) |

**Index:** `inviteCode`

---

### CampaignMember

| Colonne    | Type                     | Contraintes             | Description           |
| ---------- | ------------------------ | ----------------------- | --------------------- |
| id         | UUID                     | PK                      | Identifiant unique    |
| campaignId | UUID                     | FK → Campaign, NOT NULL | Référence campagne    |
| userId     | UUID                     | FK → User, NOT NULL     | Référence utilisateur |
| role       | ENUM('master', 'player') | NOT NULL                | Rôle dans la campagne |
| joinedAt   | TIMESTAMP                | NOT NULL, DEFAULT NOW   | Date d'arrivée        |

**Contrainte unique:** `(campaignId, userId)`

**Index:** `campaignId`, `userId`

---

### Session

| Colonne          | Type         | Contraintes             | Description                          |
| ---------------- | ------------ | ----------------------- | ------------------------------------ |
| id               | UUID         | PK                      | Identifiant unique                   |
| campaignId       | UUID         | FK → Campaign, NOT NULL | Référence campagne                   |
| number           | INTEGER      | NOT NULL                | Numéro de session                    |
| sessionDate      | DATE         | NOT NULL                | Date de la session                   |
| summary          | TEXT         | NULL                    | Résumé de la session                 |
| privateNotes     | TEXT         | NULL                    | Notes privées (MJ only)              |
| publicNotes      | TEXT         | NULL                    | Notes publiques                      |
| audioUrl         | VARCHAR(500) | NULL                    | URL du fichier audio uploadé         |
| transcript       | TEXT         | NULL                    | Transcription audio (générée par IA) |
| isPublished      | BOOLEAN      | NOT NULL, DEFAULT FALSE | Visible par les joueurs              |
| nextSessionDate  | DATE         | NULL                    | Date prochaine session               |
| nextSessionTheme | VARCHAR(500) | NULL                    | Thème prochaine session              |
| createdAt        | TIMESTAMP    | NOT NULL, DEFAULT NOW   | Date de création                     |
| updatedAt        | TIMESTAMP    | NOT NULL                | Date de modification                 |
| deletedAt        | TIMESTAMP    | NULL                    | Date de suppression (soft delete)    |

**Contrainte unique:** `(campaignId, number)`

**Index:** `campaignId`, `sessionDate`

---

### PlayerNote

| Colonne   | Type      | Contraintes            | Description                    |
| --------- | --------- | ---------------------- | ------------------------------ |
| id        | UUID      | PK                     | Identifiant unique             |
| sessionId | UUID      | FK → Session, NOT NULL | Référence session              |
| userId    | UUID      | FK → User, NOT NULL    | Référence utilisateur (joueur) |
| content   | TEXT      | NULL                   | Notes personnelles du joueur   |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW  | Date de création               |
| updatedAt | TIMESTAMP | NOT NULL               | Date de modification           |

**Contrainte unique:** `(sessionId, userId)` - Un joueur = une note par session

**Index:** `sessionId`, `userId`

---

## Notes d'implémentation

### Drizzle Schema (exemple)

```typescript
// src/lib/server/db/schema.ts

import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	boolean,
	integer,
	pgEnum
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['master', 'player']);

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	passwordHash: varchar('password_hash', { length: 255 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const campaigns = pgTable('campaigns', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 200 }).notNull(),
	description: text('description'),
	universe: varchar('universe', { length: 100 }),
	inviteCode: varchar('invite_code', { length: 8 }).notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const campaignMembers = pgTable('campaign_members', {
	id: uuid('id').primaryKey().defaultRandom(),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	role: roleEnum('role').notNull(),
	joinedAt: timestamp('joined_at').notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id),
	number: integer('number').notNull(),
	sessionDate: timestamp('session_date', { mode: 'date' }).notNull(),
	summary: text('summary'),
	privateNotes: text('private_notes'),
	publicNotes: text('public_notes'),
	audioUrl: varchar('audio_url', { length: 500 }),
	transcript: text('transcript'),
	isPublished: boolean('is_published').notNull().default(false),
	nextSessionDate: timestamp('next_session_date', { mode: 'date' }),
	nextSessionTheme: varchar('next_session_theme', { length: 500 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const playerNotes = pgTable('player_notes', {
	id: uuid('id').primaryKey().defaultRandom(),
	sessionId: uuid('session_id')
		.notNull()
		.references(() => sessions.id),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	content: text('content'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});
```

---

## Questions résolues

1. ~~**Soft delete** : Ajouter une colonne `deletedAt` sur Campaign et Session ?~~ → ✅ Oui
2. ~~**Audit log** : Tracer les modifications des sessions ?~~ → Non pour le MVP, V2
3. ~~**Sessions OAuth** : Table séparée pour les providers OAuth ?~~ → Géré par Better Auth
