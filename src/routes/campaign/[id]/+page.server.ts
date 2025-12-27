import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { campaigns, campaignPlayers, sessions, users } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const campaignId = params.id;

	// Load campaign with master info
	const campaign = await db.query.campaigns.findFirst({
		where: eq(campaigns.id, campaignId),
		with: {
			master: {
				columns: { id: true, name: true, email: true }
			}
		}
	});

	if (!campaign) {
		error(404, 'Campagne non trouvée');
	}

	// Check if user is master or player
	const isMaster = campaign.masterId === locals.user.id;

	const playerRecord = await db.query.campaignPlayers.findFirst({
		where: and(
			eq(campaignPlayers.campaignId, campaignId),
			eq(campaignPlayers.userId, locals.user.id)
		)
	});

	const isPlayer = !!playerRecord;

	// Access control
	if (!isMaster && !isPlayer) {
		error(403, 'Accès non autorisé');
	}

	// Load players with user info
	const players = await db
		.select({
			id: campaignPlayers.id,
			joinedAt: campaignPlayers.joinedAt,
			userId: users.id,
			name: users.name,
			email: users.email
		})
		.from(campaignPlayers)
		.innerJoin(users, eq(campaignPlayers.userId, users.id))
		.where(eq(campaignPlayers.campaignId, campaignId));

	// Load sessions (ordered by number desc)
	const campaignSessions = await db.query.sessions.findMany({
		where: eq(sessions.campaignId, campaignId),
		orderBy: [desc(sessions.number)]
	});

	return {
		user: locals.user,
		campaign,
		players,
		sessions: campaignSessions,
		isMaster,
		isPlayer
	};
};

export const actions = {
	createSession: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		// Verify user is the master
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut créer des sessions' });
		}

		const formData = await request.formData();
		const number = parseInt(formData.get('number') as string);
		const sessionDate = formData.get('sessionDate') as string;
		const summary = formData.get('summary') as string;
		const privateNotes = formData.get('privateNotes') as string;
		const publicNotes = formData.get('publicNotes') as string;
		const isPublished = formData.get('isPublished') === 'on';
		const nextSessionDate = formData.get('nextSessionDate') as string;
		const nextSessionTheme = formData.get('nextSessionTheme') as string;

		if (!number || !sessionDate) {
			return fail(400, { error: 'Le numéro et la date sont requis' });
		}

		await db.insert(sessions).values({
			campaignId,
			number,
			sessionDate: new Date(sessionDate),
			summary: summary || '',
			privateNotes: privateNotes || '',
			publicNotes: publicNotes || '',
			isPublished,
			nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
			nextSessionTheme: nextSessionTheme || ''
		});

		return { success: true };
	},

	updateSession: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		// Verify user is the master
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut modifier des sessions' });
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;
		const number = parseInt(formData.get('number') as string);
		const sessionDate = formData.get('sessionDate') as string;
		const summary = formData.get('summary') as string;
		const privateNotes = formData.get('privateNotes') as string;
		const publicNotes = formData.get('publicNotes') as string;
		const isPublished = formData.get('isPublished') === 'on';
		const nextSessionDate = formData.get('nextSessionDate') as string;
		const nextSessionTheme = formData.get('nextSessionTheme') as string;

		if (!sessionId || !number || !sessionDate) {
			return fail(400, { error: 'Données invalides' });
		}

		await db
			.update(sessions)
			.set({
				number,
				sessionDate: new Date(sessionDate),
				summary: summary || '',
				privateNotes: privateNotes || '',
				publicNotes: publicNotes || '',
				isPublished,
				nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
				nextSessionTheme: nextSessionTheme || '',
				updatedAt: new Date()
			})
			.where(and(eq(sessions.id, sessionId), eq(sessions.campaignId, campaignId)));

		return { success: true };
	},

	deleteSession: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		// Verify user is the master
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut supprimer des sessions' });
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;

		if (!sessionId) {
			return fail(400, { error: 'Session ID requis' });
		}

		await db
			.delete(sessions)
			.where(and(eq(sessions.id, sessionId), eq(sessions.campaignId, campaignId)));

		return { success: true };
	},

	invitePlayer: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		// Verify user is the master
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut inviter des joueurs' });
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return fail(400, { error: 'Email requis' });
		}

		// Find user by email
		const userToInvite = await db.query.users.findFirst({
			where: eq(users.email, email.toLowerCase().trim())
		});

		if (!userToInvite) {
			return fail(404, { error: 'Utilisateur non trouvé' });
		}

		// Check if already in campaign
		const existing = await db.query.campaignPlayers.findFirst({
			where: and(
				eq(campaignPlayers.campaignId, campaignId),
				eq(campaignPlayers.userId, userToInvite.id)
			)
		});

		if (existing) {
			return fail(400, { error: 'Ce joueur est déjà dans la campagne' });
		}

		// Check if trying to add the master as player
		if (userToInvite.id === campaign.masterId) {
			return fail(400, { error: 'Le MJ ne peut pas être ajouté comme joueur' });
		}

		await db.insert(campaignPlayers).values({
			campaignId,
			userId: userToInvite.id
		});

		return { success: true };
	},

	removePlayer: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		// Verify user is the master
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut retirer des joueurs' });
		}

		const formData = await request.formData();
		const playerId = formData.get('playerId') as string;

		if (!playerId) {
			return fail(400, { error: 'Player ID requis' });
		}

		await db
			.delete(campaignPlayers)
			.where(and(eq(campaignPlayers.id, playerId), eq(campaignPlayers.campaignId, campaignId)));

		return { success: true };
	}
} satisfies Actions;
