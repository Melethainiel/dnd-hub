import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { campaignPlayers } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	return { user: locals.user };
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();
		const code = (formData.get('code') as string)?.trim().toUpperCase();

		if (!code || code.length < 8) {
			return fail(400, { error: 'Code invalide', code });
		}

		// Find campaign where ID starts with the code (case insensitive)
		const allCampaigns = await db.query.campaigns.findMany();
		const campaign = allCampaigns.find((c) => c.id.substring(0, 8).toUpperCase() === code);

		if (!campaign) {
			return fail(404, { error: 'Campagne non trouvée', code });
		}

		// Check if user is the master
		if (campaign.masterId === locals.user.id) {
			return fail(400, { error: 'Vous êtes déjà le MJ de cette campagne', code });
		}

		// Check if already a player
		const existing = await db.query.campaignPlayers.findFirst({
			where: and(
				eq(campaignPlayers.campaignId, campaign.id),
				eq(campaignPlayers.userId, locals.user.id)
			)
		});

		if (existing) {
			return fail(400, { error: 'Vous êtes déjà membre de cette campagne', code });
		}

		// Add player to campaign
		await db.insert(campaignPlayers).values({
			campaignId: campaign.id,
			userId: locals.user.id
		});

		redirect(302, `/campaign/${campaign.id}`);
	}
} satisfies Actions;
