import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/auth/password';
import { createSession, setSessionCookie } from '$lib/server/auth/session';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
};

export const actions = {
	default: async ({ request, cookies, ...event }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { error: 'Invalid form data' });
		}

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (!user) {
			return fail(400, { error: 'Invalid email or password' });
		}

		const validPassword = await verifyPassword(user.passwordHash, password);

		if (!validPassword) {
			return fail(400, { error: 'Invalid email or password' });
		}

		const { session, token } = await createSession(user.id);

		setSessionCookie({ cookies, ...event } as any, token, session.expiresAt);

		redirect(302, '/dashboard');
	}
} satisfies Actions;
