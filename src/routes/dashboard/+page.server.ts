import { redirect } from '@sveltejs/kit';
import { eq, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { campaigns, campaignPlayers } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const userId = locals.user.id;

	// Get campaigns where user is master
	const masterCampaigns = await db.select().from(campaigns).where(eq(campaigns.masterId, userId));

	// Get campaigns where user is player
	const playerMemberships = await db
		.select({ campaignId: campaignPlayers.campaignId })
		.from(campaignPlayers)
		.where(eq(campaignPlayers.userId, userId));

	const playerCampaignIds = playerMemberships.map((m) => m.campaignId);

	let playerCampaigns: typeof masterCampaigns = [];
	if (playerCampaignIds.length > 0) {
		playerCampaigns = await db
			.select()
			.from(campaigns)
			.where(or(...playerCampaignIds.map((id) => eq(campaigns.id, id))));
	}

	return {
		user: locals.user,
		masterCampaigns,
		playerCampaigns
	};
};
