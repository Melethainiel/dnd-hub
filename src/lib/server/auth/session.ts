import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import { authSessions, users } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const SESSION_DURATION_DAYS = 30;

export type SessionUser = {
	id: string;
	email: string;
	name: string;
};

export type Session = {
	id: string;
	userId: string;
	expiresAt: Date;
};

export type SessionValidationResult =
	| { session: Session; user: SessionUser }
	| { session: null; user: null };

function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	return encodeBase32LowerCaseNoPadding(bytes);
}

function hashToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function createSession(userId: string): Promise<{ session: Session; token: string }> {
	const token = generateSessionToken();
	const sessionId = hashToken(token);
	const expiresAt = new Date(Date.now() + DAY_IN_MS * SESSION_DURATION_DAYS);

	const session: Session = { id: sessionId, userId, expiresAt };

	await db.insert(authSessions).values(session);

	return { session, token };
}

export async function validateSession(token: string): Promise<SessionValidationResult> {
	const sessionId = hashToken(token);

	const result = await db
		.select({
			session: authSessions,
			user: { id: users.id, email: users.email, name: users.name }
		})
		.from(authSessions)
		.innerJoin(users, eq(authSessions.userId, users.id))
		.where(eq(authSessions.id, sessionId))
		.limit(1);

	if (result.length === 0) {
		return { session: null, user: null };
	}

	const { session, user } = result[0];

	// Check if session is expired
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(authSessions).where(eq(authSessions.id, sessionId));
		return { session: null, user: null };
	}

	// Extend session if it expires in less than 15 days
	if (Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15) {
		const newExpiresAt = new Date(Date.now() + DAY_IN_MS * SESSION_DURATION_DAYS);
		await db
			.update(authSessions)
			.set({ expiresAt: newExpiresAt })
			.where(eq(authSessions.id, sessionId));
		session.expiresAt = newExpiresAt;
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(authSessions).where(eq(authSessions.id, sessionId));
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
	await db.delete(authSessions).where(eq(authSessions.userId, userId));
}

// Cookie helpers
const SESSION_COOKIE_NAME = 'session';

export function setSessionCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionCookie(event: RequestEvent): void {
	event.cookies.set(SESSION_COOKIE_NAME, '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	});
}

export function getSessionToken(event: RequestEvent): string | undefined {
	return event.cookies.get(SESSION_COOKIE_NAME);
}
