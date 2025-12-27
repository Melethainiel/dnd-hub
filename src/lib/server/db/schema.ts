import { pgTable, pgEnum, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Users
// ============================================================================

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
	campaignsAsMaster: many(campaigns),
	campaignMemberships: many(campaignPlayers)
}));

// ============================================================================
// Campaigns
// ============================================================================

export const campaigns = pgTable('campaigns', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description').notNull().default(''),
	universe: text('universe').notNull().default(''),
	masterId: uuid('master_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
	master: one(users, {
		fields: [campaigns.masterId],
		references: [users.id]
	}),
	players: many(campaignPlayers),
	sessions: many(sessions)
}));

// ============================================================================
// Campaign Players (many-to-many)
// ============================================================================

export const campaignPlayers = pgTable('campaign_players', {
	id: uuid('id').primaryKey().defaultRandom(),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	joinedAt: timestamp('joined_at').notNull().defaultNow()
});

export const campaignPlayersRelations = relations(campaignPlayers, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [campaignPlayers.campaignId],
		references: [campaigns.id]
	}),
	user: one(users, {
		fields: [campaignPlayers.userId],
		references: [users.id]
	})
}));

// ============================================================================
// Sessions
// ============================================================================

export const sessionStatusEnum = pgEnum('session_status', [
	'scheduled',
	'active',
	'completed',
	'published'
]);

export type SessionStatus = (typeof sessionStatusEnum.enumValues)[number];

export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id, { onDelete: 'cascade' }),
	number: integer('number').notNull(),
	title: text('title').notNull().default(''),
	status: sessionStatusEnum('status').notNull().default('scheduled'),
	sessionDate: timestamp('session_date').notNull(),
	// Collaborative content (Markdown) - edited via Yjs/Tiptap
	collaborativeContent: text('collaborative_content').notNull().default(''),
	summary: text('summary').notNull().default(''),
	privateNotes: text('private_notes').notNull().default(''),
	publicNotes: text('public_notes').notNull().default(''),
	isPublished: boolean('is_published').notNull().default(false),
	nextSessionDate: timestamp('next_session_date'),
	nextSessionTheme: text('next_session_theme').notNull().default(''),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [sessions.campaignId],
		references: [campaigns.id]
	})
}));

// ============================================================================
// Auth Sessions (login tokens)
// ============================================================================

export const authSessions = pgTable('auth_sessions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
	user: one(users, {
		fields: [authSessions.userId],
		references: [users.id]
	})
}));
