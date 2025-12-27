<script lang="ts">
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
		sessionDate: Date;
		summary: string;
		publicNotes: string;
		isPublished: boolean;
		nextSessionDate: Date | null;
		nextSessionTheme: string;
	}

	let { campaign, sessions }: { campaign: Campaign; sessions: Session[] } = $props();

	// Players only see published sessions
	let publicSessions = $derived(sessions.filter((s) => s.isPublished));
	let selectedSessionId = $state<string | null>(null);

	// Auto-select first public session
	$effect(() => {
		if (publicSessions.length > 0 && !selectedSessionId) {
			selectedSessionId = publicSessions[0].id;
		}
	});

	let selectedSession = $derived(publicSessions.find((s) => s.id === selectedSessionId) ?? null);

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

	<!-- Sessions Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Session List -->
		<div class="lg:col-span-1">
			<div class="card bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title text-lg">📖 Résumés de Sessions</h3>
					{#if publicSessions.length === 0}
						<p class="text-base-content/60">Aucun résumé disponible pour le moment</p>
					{:else}
						<div class="space-y-2">
							{#each publicSessions as session (session.id)}
								<button
									class="btn w-full justify-start text-left btn-ghost"
									class:btn-active={selectedSessionId === session.id}
									onclick={() => (selectedSessionId = session.id)}
								>
									<div>
										<div class="font-semibold">Session {session.number}</div>
										<div class="text-xs opacity-60">
											{formatShortDate(session.sessionDate)}
										</div>
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
			{#if selectedSession}
				<div class="card bg-base-100 shadow">
					<div class="card-body space-y-6">
						<!-- Header -->
						<div>
							<h3 class="text-2xl font-bold">Session {selectedSession.number}</h3>
							<p class="text-base-content/60">{formatDate(selectedSession.sessionDate)}</p>
						</div>

						<!-- Summary -->
						<div class="border-t pt-4">
							<h4 class="mb-2 text-lg font-semibold">📝 Résumé</h4>
							<p class="whitespace-pre-wrap">
								{selectedSession.summary || 'Aucun résumé'}
							</p>
						</div>

						<!-- Public Notes -->
						{#if selectedSession.publicNotes}
							<div class="border-t pt-4">
								<h4 class="mb-2 text-lg font-semibold">✏️ Notes publiques</h4>
								<p class="whitespace-pre-wrap">
									{selectedSession.publicNotes}
								</p>
							</div>
						{/if}

						<!-- Next Session -->
						{#if selectedSession.nextSessionTheme}
							<div class="rounded-lg border border-info/30 bg-info/10 p-4">
								<h4 class="mb-2 text-lg font-semibold text-info">🎲 Prochaine session</h4>
								<p class="text-info/90">{selectedSession.nextSessionTheme}</p>
								{#if selectedSession.nextSessionDate}
									<p class="mt-2 text-sm text-info/70">
										Prévue le {formatShortDate(selectedSession.nextSessionDate)}
									</p>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="card bg-base-100 shadow">
					<div class="card-body py-12 text-center">
						<p class="text-base-content/60">Sélectionnez une session pour voir les détails</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
