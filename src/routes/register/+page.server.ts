import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth/password';
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
		const name = formData.get('name');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (
			typeof email !== 'string' ||
			typeof name !== 'string' ||
			typeof password !== 'string' ||
			typeof confirmPassword !== 'string'
		) {
			return fail(400, { error: 'Invalid form data' });
		}

		if (!email || !name || !password) {
			return fail(400, { error: 'All fields are required' });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		// Check if email already exists
		const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (existingUser) {
			return fail(400, { error: 'Email already in use' });
		}

		const passwordHash = await hashPassword(password);

		const [newUser] = await db
			.insert(users)
			.values({
				email,
				name,
				passwordHash
			})
			.returning();

		const { session, token } = await createSession(newUser.id);

		setSessionCookie({ cookies, ...event } as any, token, session.expiresAt);

		redirect(302, '/dashboard');
	}
} satisfies Actions;
