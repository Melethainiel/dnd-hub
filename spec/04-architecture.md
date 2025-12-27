# Architecture Technique

## Stack Finalisée

| Couche             | Choix                    | Justification                             |
| ------------------ | ------------------------ | ----------------------------------------- |
| **Framework**      | SvelteKit 2              | SSR natif, routing file-based             |
| **UI**             | Svelte 5 (runes)         | Réactivité fine, DX moderne               |
| **Components**     | DaisyUI                  | Thèmes dark/light inclus, Tailwind-native |
| **Styling**        | Tailwind CSS 4           | Utility-first                             |
| **ORM**            | Drizzle                  | Type-safe, léger                          |
| **Database**       | PostgreSQL               | Relationnel, robuste, via Docker          |
| **Auth**           | Better Auth              | Moderne, SvelteKit-first                  |
| **Auth Providers** | Email/Password + Discord | Communauté JDR sur Discord                |
| **Validation**     | Zod                      | Standard, écosystème large                |
| **Tests**          | Vitest + Playwright      | Unit + E2E                                |
| **i18n**           | Paraglide                | FR + EN                                   |
| **Déploiement**    | VPS + Docker             | Contrôle total                            |

---

## Choix Finalisés

### Authentification : Better Auth + Discord

```typescript
// src/lib/server/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		discord: {
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!
		}
	}
});
```

### UI : DaisyUI avec thèmes

```javascript
// tailwind.config.js
export default {
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['light', 'dark']
	}
};
```

### Validation : Zod

```typescript
import { z } from 'zod';

const createSessionSchema = z.object({
	number: z.number().int().positive(),
	sessionDate: z.string().datetime(),
	summary: z.string().min(1).max(10000),
	privateNotes: z.string().max(10000).optional(),
	publicNotes: z.string().max(10000).optional()
});
```

---

### Structure des Routes

```
src/routes/
├── (auth)/
│   ├── login/
│   │   └── +page.svelte
│   ├── register/
│   │   └── +page.svelte
│   └── logout/
│       └── +server.ts
├── (app)/
│   ├── +layout.svelte          # Layout authentifié
│   ├── +layout.server.ts       # Guard auth
│   ├── dashboard/
│   │   └── +page.svelte
│   └── campaign/
│       └── [id]/
│           ├── +page.svelte    # Vue selon rôle (MJ/Player)
│           ├── +page.server.ts # Load campaign + sessions
│           ├── sessions/
│           │   ├── new/
│           │   │   └── +page.svelte
│           │   └── [sessionId]/
│           │       ├── +page.svelte
│           │       └── edit/
│           │           └── +page.svelte
│           └── players/
│               └── +page.svelte
├── join/
│   └── [code]/
│       └── +page.svelte        # Rejoindre via code
└── +page.svelte                # Landing / Redirect
```

---

### Organisation du Code

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/                 # Composants génériques (Button, Modal, etc.)
│   │   ├── campaign/           # Composants liés aux campagnes
│   │   ├── session/            # Composants liés aux sessions
│   │   └── layout/             # Header, Sidebar, etc.
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts        # Client Drizzle
│   │   │   └── schema.ts       # Schéma des tables
│   │   ├── auth/               # Logique d'authentification
│   │   └── services/           # Business logic
│   │       ├── campaign.ts
│   │       ├── session.ts
│   │       └── user.ts
│   ├── stores/                 # Svelte stores si nécessaire
│   ├── utils/                  # Helpers, formatters
│   └── types.ts                # Types partagés
├── routes/                     # Voir structure ci-dessus
└── app.css                     # Styles globaux
```

---

## Patterns Recommandés

### 1. Form Actions (SvelteKit)

Utiliser les form actions pour les mutations :

```svelte
<!-- +page.svelte -->
<form method="POST" action="?/createSession">
	<input name="summary" />
	<button type="submit">Créer</button>
</form>
```

```typescript
// +page.server.ts
export const actions = {
	createSession: async ({ request, locals }) => {
		const data = await request.formData();
		// ...
	}
};
```

### 2. Load Functions

Charger les données côté serveur :

```typescript
// +page.server.ts
export const load = async ({ params, locals }) => {
	const campaign = await getCampaign(params.id);
	const sessions = await getSessions(params.id);

	return { campaign, sessions };
};
```

### 3. Autorisation par Route

```typescript
// (app)/+layout.server.ts
export const load = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirectTo=${url.pathname}`);
	}
	return { user: locals.user };
};
```

### 4. Autorisation par Campagne

```typescript
// campaign/[id]/+page.server.ts
export const load = async ({ params, locals }) => {
	const membership = await getMembership(params.id, locals.user.id);

	if (!membership) {
		throw error(403, 'Accès non autorisé');
	}

	return {
		campaign: await getCampaign(params.id),
		role: membership.role,
		sessions: await getSessions(params.id, membership.role)
	};
};
```

---

## Sécurité

### Notes Privées

Les notes privées ne doivent **jamais** être envoyées au client pour un joueur :

```typescript
// Dans le service
export async function getSessionsForPlayer(campaignId: string) {
	return db.query.sessions.findMany({
		where: and(eq(sessions.campaignId, campaignId), eq(sessions.isPublished, true)),
		columns: {
			privateNotes: false // Jamais exposé
		}
	});
}
```

### Validation des Inputs

Utiliser Zod pour valider les entrées :

```typescript
import { z } from 'zod';

const createSessionSchema = z.object({
	number: z.number().int().positive(),
	sessionDate: z.string().datetime(),
	summary: z.string().min(1).max(10000),
	privateNotes: z.string().max(10000).optional(),
	publicNotes: z.string().max(10000).optional()
});
```

---

## Déploiement

### Docker Compose Production

```yaml
# docker-compose.prod.yml
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/dndhub
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=dndhub
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Questions Résolues

~~1. **Auth** : Lucia, Better Auth, ou Auth.js ?~~ → **Better Auth + Discord**
~~2. **Validation** : Zod, Valibot, ou validation native ?~~ → **Zod**
~~3. **UI Components** : Shadcn-svelte, Skeleton, Melt UI, ou custom ?~~ → **DaisyUI**
~~4. **Rich Text** : Markdown simple ou éditeur WYSIWYG ?~~ → **Markdown simple**
