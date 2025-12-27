import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, locals.user.id),
		columns: {
			id: true,
			name: true,
			email: true,
			createdAt: true
		}
	});

	if (!user) {
		throw redirect(302, '/login');
	}

	return { user };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return fail(400, { error: 'Name is required' });
		}

		const trimmedName = name.trim();

		if (trimmedName.length > 100) {
			return fail(400, { error: 'Name is too long' });
		}

		await db
			.update(users)
			.set({
				name: trimmedName,
				updatedAt: new Date()
			})
			.where(eq(users.id, locals.user.id));

		return { success: true };
	}
};
