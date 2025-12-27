import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { campaigns } from '$lib/server/db/schema';

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
		const name = formData.get('name');
		const universe = formData.get('universe');
		const description = formData.get('description');

		if (
			typeof name !== 'string' ||
			typeof universe !== 'string' ||
			typeof description !== 'string'
		) {
			return fail(400, { error: 'Données invalides' });
		}

		if (!name.trim()) {
			return fail(400, { error: 'Le nom est requis', name, universe, description });
		}

		const [newCampaign] = await db
			.insert(campaigns)
			.values({
				name: name.trim(),
				universe: universe.trim(),
				description: description.trim(),
				masterId: locals.user.id
			})
			.returning();

		redirect(302, `/campaign/${newCampaign.id}`);
	}
} satisfies Actions;
