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
		const title = formData.get('title') as string;
		const sessionDate = formData.get('sessionDate') as string;

		if (!number || !sessionDate) {
			return fail(400, { error: 'Le numéro et la date sont requis' });
		}

		// New sessions start as 'scheduled'
		await db.insert(sessions).values({
			campaignId,
			number,
			title: title || '',
			status: 'scheduled',
			sessionDate: new Date(sessionDate)
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
		const title = formData.get('title') as string;
		const sessionDate = formData.get('sessionDate') as string;
		const summary = formData.get('summary') as string;
		const privateNotes = formData.get('privateNotes') as string;

		if (!sessionId || !number || !sessionDate) {
			return fail(400, { error: 'Données invalides' });
		}

		await db
			.update(sessions)
			.set({
				number,
				title: title || '',
				sessionDate: new Date(sessionDate),
				summary: summary || '',
				privateNotes: privateNotes || '',
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

	// Session lifecycle transitions (MJ only)
	startSession: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut démarrer une session' });
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;

		if (!sessionId) {
			return fail(400, { error: 'Session ID requis' });
		}

		// Verify session is in 'scheduled' status
		const session = await db.query.sessions.findFirst({
			where: and(eq(sessions.id, sessionId), eq(sessions.campaignId, campaignId))
		});

		if (!session) {
			return fail(404, { error: 'Session non trouvée' });
		}

		if (session.status !== 'scheduled') {
			return fail(400, { error: 'Seule une session planifiée peut être démarrée' });
		}

		await db
			.update(sessions)
			.set({ status: 'active', updatedAt: new Date() })
			.where(eq(sessions.id, sessionId));

		return { success: true };
	},

	completeSession: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut terminer une session' });
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;

		if (!sessionId) {
			return fail(400, { error: 'Session ID requis' });
		}

		const session = await db.query.sessions.findFirst({
			where: and(eq(sessions.id, sessionId), eq(sessions.campaignId, campaignId))
		});

		if (!session) {
			return fail(404, { error: 'Session non trouvée' });
		}

		if (session.status !== 'active') {
			return fail(400, { error: 'Seule une session active peut être terminée' });
		}

		await db
			.update(sessions)
			.set({ status: 'completed', updatedAt: new Date() })
			.where(eq(sessions.id, sessionId));

		return { success: true };
	},

	publishSession: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut publier une session' });
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;

		if (!sessionId) {
			return fail(400, { error: 'Session ID requis' });
		}

		const session = await db.query.sessions.findFirst({
			where: and(eq(sessions.id, sessionId), eq(sessions.campaignId, campaignId))
		});

		if (!session) {
			return fail(404, { error: 'Session non trouvée' });
		}

		if (session.status !== 'completed') {
			return fail(400, { error: 'Seule une session terminée peut être publiée' });
		}

		await db
			.update(sessions)
			.set({
				status: 'published',
				isPublished: true,
				updatedAt: new Date()
			})
			.where(eq(sessions.id, sessionId));

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
	},

	updateCampaign: async ({ request, params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		// Verify user is the master
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut modifier la campagne' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const universe = formData.get('universe') as string;
		const description = formData.get('description') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Le nom est requis' });
		}

		await db
			.update(campaigns)
			.set({
				name: name.trim(),
				universe: universe?.trim() || '',
				description: description?.trim() || '',
				updatedAt: new Date()
			})
			.where(eq(campaigns.id, campaignId));

		return { success: true, settingsUpdated: true };
	},

	deleteCampaign: async ({ params, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const campaignId = params.id;

		// Verify user is the master
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign || campaign.masterId !== locals.user.id) {
			return fail(403, { error: 'Seul le MJ peut supprimer la campagne' });
		}

		// Delete campaign (cascade will handle players and sessions)
		await db.delete(campaigns).where(eq(campaigns.id, campaignId));

		redirect(302, '/dashboard');
	},

	saveCollaborativeContent: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Non authentifié' });
		}

		const campaignId = params.id;

		// Verify user is master or player in this campaign
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId)
		});

		if (!campaign) {
			return fail(404, { error: 'Campagne non trouvée' });
		}

		const isMaster = campaign.masterId === locals.user.id;

		const playerRecord = await db.query.campaignPlayers.findFirst({
			where: and(
				eq(campaignPlayers.campaignId, campaignId),
				eq(campaignPlayers.userId, locals.user.id)
			)
		});

		const isPlayer = !!playerRecord;

		if (!isMaster && !isPlayer) {
			return fail(403, { error: 'Accès non autorisé' });
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId') as string;
		const content = formData.get('content') as string;

		if (!sessionId) {
			return fail(400, { error: 'Session ID requis' });
		}

		// Verify session belongs to this campaign and is editable
		const session = await db.query.sessions.findFirst({
			where: and(eq(sessions.id, sessionId), eq(sessions.campaignId, campaignId))
		});

		if (!session) {
			return fail(404, { error: 'Session non trouvée' });
		}

		// Only allow editing for active or completed sessions
		if (session.status === 'published') {
			return fail(403, { error: 'Session publiée, modification impossible' });
		}

		await db
			.update(sessions)
			.set({
				collaborativeContent: content || '',
				updatedAt: new Date()
			})
			.where(eq(sessions.id, sessionId));

		return { success: true };
	}
} satisfies Actions;
