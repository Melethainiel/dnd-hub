import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteSessionCookie, invalidateSession } from '$lib/server/auth/session';

export const load: PageServerLoad = async () => {
	redirect(302, '/');
};

export const actions = {
	default: async (event) => {
		if (event.locals.session) {
			await invalidateSession(event.locals.session.id);
		}
		deleteSessionCookie(event);
		redirect(302, '/login');
	}
} satisfies Actions;
