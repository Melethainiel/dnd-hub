<script lang="ts">
	import SessionStatusBadge from './SessionStatusBadge.svelte';
	import ActiveSessionPanel from './ActiveSessionPanel.svelte';
	import CollaborativeEditor from './CollaborativeEditor.svelte';
	import type { SessionStatus } from '$lib/server/db/schema';

	interface Campaign {
		id: string;
		name: string;
		description: string;
		universe: string;
		masterId: string;
	}

	interface Session {
		id: string;
		number: number;
		title: string;
		status: SessionStatus;
		sessionDate: Date;
		summary: string;
		collaborativeContent: string;
	}

	let {
		campaign,
		sessions,
		userName
	}: {
		campaign: Campaign;
		sessions: Session[];
		userName: string;
	} = $props();

	// Players see active sessions (to participate) and published/completed sessions (to read)
	let activeSessions = $derived(sessions.filter((s) => s.status === 'active'));
	let publishedSessions = $derived(
		sessions.filter((s) => s.status === 'published' || s.status === 'completed')
	);
	let scheduledSessions = $derived(sessions.filter((s) => s.status === 'scheduled'));

	let selectedSessionId = $state<string | null>(null);
	let activeTab = $state<'active' | 'published' | 'upcoming'>('active');

	// Auto-select based on what's available
	$effect(() => {
		if (activeSessions.length > 0) {
			activeTab = 'active';
			if (!selectedSessionId || !activeSessions.find((s) => s.id === selectedSessionId)) {
				selectedSessionId = activeSessions[0].id;
			}
		} else if (publishedSessions.length > 0) {
			activeTab = 'published';
			if (!selectedSessionId || !publishedSessions.find((s) => s.id === selectedSessionId)) {
				selectedSessionId = publishedSessions[0].id;
			}
		}
	});

	let selectedSession = $derived(sessions.find((s) => s.id === selectedSessionId) ?? null);

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatShortDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR');
	}

	// Create save handler for a specific session
	function createSaveHandler(sessionId: string): (content: string) => void {
		return async (content: string) => {
			const formData = new FormData();
			formData.append('sessionId', sessionId);
			formData.append('content', content);

			try {
				await fetch('?/saveCollaborativeContent', {
					method: 'POST',
					body: formData
				});
			} catch (error) {
				console.error('Failed to save collaborative content:', error);
			}
		};
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4 rounded-lg border border-secondary/30 bg-secondary/10 p-6">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-8 w-8 text-secondary"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
			/>
		</svg>
		<div>
			<h2 class="text-2xl font-bold text-secondary">{campaign.name}</h2>
			<p class="text-secondary/80">{campaign.universe || 'Univers non défini'} - Espace Joueur</p>
		</div>
	</div>

	<!-- Active Session Alert -->
	{#if activeSessions.length > 0}
		<div class="alert alert-warning">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<span>
				<strong>Session en cours !</strong> Vous pouvez participer en ajoutant vos notes.
			</span>
		</div>
	{/if}

	<!-- Session Tabs -->
	<div role="tablist" class="tabs-bordered tabs">
		<button
			role="tab"
			class="tab"
			class:tab-active={activeTab === 'active'}
			onclick={() => (activeTab = 'active')}
		>
			En cours ({activeSessions.length})
		</button>
		<button
			role="tab"
			class="tab"
			class:tab-active={activeTab === 'published'}
			onclick={() => (activeTab = 'published')}
		>
			Sessions terminées ({publishedSessions.length})
		</button>
		<button
			role="tab"
			class="tab"
			class:tab-active={activeTab === 'upcoming'}
			onclick={() => (activeTab = 'upcoming')}
		>
			Prochaines sessions ({scheduledSessions.length})
		</button>
	</div>

	<!-- Active Sessions -->
	{#if activeTab === 'active'}
		{#if activeSessions.length === 0}
			<div class="card bg-base-100 shadow">
				<div class="card-body py-12 text-center">
					<p class="text-base-content/60">Aucune session en cours pour le moment</p>
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				{#each activeSessions as session (session.id)}
					<ActiveSessionPanel {session} {userName} onSave={createSaveHandler(session.id)} />
				{/each}
			</div>
		{/if}
	{/if}

	<!-- Published Sessions -->
	{#if activeTab === 'published'}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Session List -->
			<div class="lg:col-span-1">
				<div class="card bg-base-100 shadow">
					<div class="card-body">
						<h3 class="card-title text-lg">Sessions terminées</h3>
						{#if publishedSessions.length === 0}
							<p class="text-base-content/60">Aucun résumé disponible pour le moment</p>
						{:else}
							<div class="space-y-2">
								{#each publishedSessions as session (session.id)}
									<button
										class="btn w-full justify-start text-left btn-ghost"
										class:btn-active={selectedSessionId === session.id}
										onclick={() => (selectedSessionId = session.id)}
									>
										<div class="flex w-full items-center justify-between">
											<div>
												<div class="font-semibold">
													Session {session.number}
													{#if session.title}
														<span class="font-normal text-base-content/70">— {session.title}</span>
													{/if}
												</div>
												<div class="text-xs opacity-60">{formatShortDate(session.sessionDate)}</div>
											</div>
											<SessionStatusBadge status={session.status} />
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Session Detail -->
			<div class="lg:col-span-2">
				{#if selectedSession && (selectedSession.status === 'published' || selectedSession.status === 'completed')}
					{#if selectedSession.status === 'completed'}
						<!-- Completed session: can still add notes -->
						{#key selectedSession.id}
							<ActiveSessionPanel
								session={selectedSession}
								{userName}
								onSave={createSaveHandler(selectedSession.id)}
							/>
						{/key}
					{:else}
						<!-- Published session: read-only view -->
						<div class="card bg-base-100 shadow">
							<div class="card-body space-y-6">
								<!-- Header -->
								<div class="flex items-start justify-between">
									<div>
										<h3 class="text-2xl font-bold">
											Session {selectedSession.number}
											{#if selectedSession.title}
												<span class="text-lg font-normal text-base-content/70"
													>— {selectedSession.title}</span
												>
											{/if}
										</h3>
										<p class="text-base-content/60">{formatDate(selectedSession.sessionDate)}</p>
									</div>
									<SessionStatusBadge status={selectedSession.status} />
								</div>

								<!-- Summary - Collaborative Notes -->
								<div class="border-t border-base-300 pt-4">
									<h4 class="mb-2 text-lg font-semibold">Résumé / Notes</h4>
									{#key selectedSession.id}
										<CollaborativeEditor
											sessionId={selectedSession.id}
											initialContent={selectedSession.collaborativeContent}
											readonly={true}
											{userName}
										/>
									{/key}
								</div>
							</div>
						</div>
					{/if}
				{:else}
					<div class="card bg-base-100 shadow">
						<div class="card-body py-12 text-center">
							<p class="text-base-content/60">Sélectionnez une session pour voir les détails</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Upcoming Sessions -->
	{#if activeTab === 'upcoming'}
		{#if scheduledSessions.length === 0}
			<div class="card bg-base-100 shadow">
				<div class="card-body py-12 text-center">
					<p class="text-base-content/60">Aucune session planifiée pour le moment</p>
				</div>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each scheduledSessions as session (session.id)}
					<div class="card bg-base-100 shadow">
						<div class="card-body">
							<div class="flex items-center justify-between">
								<h3 class="card-title">Session {session.number}</h3>
								<SessionStatusBadge status={session.status} />
							</div>
							{#if session.title}
								<p class="text-base-content/70">{session.title}</p>
							{/if}
							<p class="text-sm text-base-content/60">{formatDate(session.sessionDate)}</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
