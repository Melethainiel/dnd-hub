<script lang="ts">
	import { enhance } from '$app/forms';
	import SessionForm from './SessionForm.svelte';
	import PlayerManagement from './PlayerManagement.svelte';
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
		privateNotes: string;
		collaborativeContent: string;
	}

	interface Player {
		id: string;
		userId: string;
		name: string;
		email: string;
		joinedAt: Date;
	}

	interface ActionResult {
		error?: string;
		success?: boolean;
		settingsUpdated?: boolean;
	}

	let {
		campaign,
		sessions,
		players,
		userName,
		form
	}: {
		campaign: Campaign;
		sessions: Session[];
		players: Player[];
		userName: string;
		form: ActionResult | null;
	} = $props();

	let activeTab = $state<'sessions' | 'players' | 'settings'>('sessions');
	let sessionStatusFilter = $state<SessionStatus | 'all'>('all');
	let showNewSession = $state(false);
	let editingSessionId = $state<string | null>(null);
	let selectedSessionId = $state<string | null>(null);

	// Filter sessions by status
	const filteredSessions = $derived(
		sessionStatusFilter === 'all'
			? sessions
			: sessions.filter((s) => s.status === sessionStatusFilter)
	);

	// Count sessions by status
	const sessionCounts = $derived({
		scheduled: sessions.filter((s) => s.status === 'scheduled').length,
		active: sessions.filter((s) => s.status === 'active').length,
		completed: sessions.filter((s) => s.status === 'completed').length,
		published: sessions.filter((s) => s.status === 'published').length
	});

	let selectedSession = $derived(sessions.find((s) => s.id === selectedSessionId) ?? null);

	// Auto-select first session when filter changes or on mount
	$effect(() => {
		if (filteredSessions.length > 0 && !filteredSessions.find((s) => s.id === selectedSessionId)) {
			selectedSessionId = filteredSessions[0].id;
		}
	});

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

	// Get next action button config based on session status
	function getNextAction(
		status: SessionStatus
	): { label: string; action: string; class: string } | null {
		switch (status) {
			case 'scheduled':
				return { label: 'Démarrer', action: '?/startSession', class: 'btn-warning' };
			case 'active':
				return { label: 'Terminer', action: '?/completeSession', class: 'btn-accent' };
			case 'completed':
				return { label: 'Publier', action: '?/publishSession', class: 'btn-success' };
			default:
				return null;
		}
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
	<div class="flex items-center gap-4 rounded-lg border border-info/30 bg-info/10 p-6">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-8 w-8 text-info"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
			/>
		</svg>
		<div>
			<h2 class="text-2xl font-bold text-info">{campaign.name}</h2>
			<p class="text-info/80">
				{campaign.universe || 'Univers non défini'} - Espace Maître de Jeu Privé
			</p>
		</div>
	</div>

	<!-- Main Tabs -->
	<div role="tablist" class="tabs-boxed tabs w-fit">
		<button
			role="tab"
			class="tab gap-2"
			class:tab-active={activeTab === 'sessions'}
			onclick={() => (activeTab = 'sessions')}
		>
			Sessions ({sessions.length})
		</button>
		<button
			role="tab"
			class="tab gap-2"
			class:tab-active={activeTab === 'players'}
			onclick={() => (activeTab = 'players')}
		>
			Joueurs ({players.length})
		</button>
		<button
			role="tab"
			class="tab gap-2"
			class:tab-active={activeTab === 'settings'}
			onclick={() => (activeTab = 'settings')}
		>
			Paramètres
		</button>
	</div>

	<!-- Sessions Tab -->
	{#if activeTab === 'sessions'}
		<div class="space-y-6">
			{#if form?.error}
				<div class="alert alert-error">
					<span>{form.error}</span>
				</div>
			{/if}

			<!-- Session Status Filter & New Session Button -->
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div role="tablist" class="tabs-bordered tabs">
					<button
						role="tab"
						class="tab"
						class:tab-active={sessionStatusFilter === 'all'}
						onclick={() => (sessionStatusFilter = 'all')}
					>
						Toutes ({sessions.length})
					</button>
					<button
						role="tab"
						class="tab"
						class:tab-active={sessionStatusFilter === 'scheduled'}
						onclick={() => (sessionStatusFilter = 'scheduled')}
					>
						Planifiées ({sessionCounts.scheduled})
					</button>
					<button
						role="tab"
						class="tab"
						class:tab-active={sessionStatusFilter === 'active'}
						onclick={() => (sessionStatusFilter = 'active')}
					>
						En cours ({sessionCounts.active})
					</button>
					<button
						role="tab"
						class="tab"
						class:tab-active={sessionStatusFilter === 'completed'}
						onclick={() => (sessionStatusFilter = 'completed')}
					>
						Terminées ({sessionCounts.completed})
					</button>
					<button
						role="tab"
						class="tab"
						class:tab-active={sessionStatusFilter === 'published'}
						onclick={() => (sessionStatusFilter = 'published')}
					>
						Publiées ({sessionCounts.published})
					</button>
				</div>
				<button class="btn gap-2 btn-primary" onclick={() => (showNewSession = !showNewSession)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Planifier une session
				</button>
			</div>

			<!-- New Session Form -->
			{#if showNewSession}
				<div class="card bg-base-100 shadow">
					<div class="card-body">
						<h4 class="card-title">Planifier une nouvelle session</h4>
						<SessionForm
							nextNumber={sessions.length + 1}
							oncancel={() => (showNewSession = false)}
							onsuccess={() => (showNewSession = false)}
						/>
					</div>
				</div>
			{/if}

			<!-- Sessions Grid -->
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Session List -->
				<div class="lg:col-span-1">
					<div class="card bg-base-100 shadow">
						<div class="card-body">
							<h3 class="card-title text-lg">Sessions</h3>
							{#if filteredSessions.length === 0}
								<p class="py-4 text-center text-base-content/60">
									Aucune session {sessionStatusFilter !== 'all' ? 'dans cette catégorie' : ''}
								</p>
							{:else}
								<div class="space-y-2">
									{#each filteredSessions as session (session.id)}
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
															<span class="font-normal text-base-content/70">— {session.title}</span
															>
														{/if}
													</div>
													<div class="text-xs opacity-60">
														{formatShortDate(session.sessionDate)}
													</div>
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
					{#if selectedSession}
						{#if selectedSession.status === 'active' || selectedSession.status === 'completed'}
							<!-- Active/Completed Session: Show collaborative notes panel -->
							<div class="space-y-4">
								{#key selectedSession.id}
									<ActiveSessionPanel
										session={selectedSession}
										{userName}
										onSave={createSaveHandler(selectedSession.id)}
									/>
								{/key}

								<!-- MJ Controls -->
								<div class="card bg-base-100 shadow">
									<div class="card-body">
										<h4 class="card-title text-lg">Actions MJ</h4>
										<div class="flex flex-wrap gap-2">
											{#if selectedSession.status === 'active'}
												<form method="POST" action="?/completeSession" use:enhance>
													<input type="hidden" name="sessionId" value={selectedSession.id} />
													<button type="submit" class="btn btn-accent">
														Terminer la session
													</button>
												</form>
											{:else if selectedSession.status === 'completed'}
												<form method="POST" action="?/publishSession" use:enhance>
													<input type="hidden" name="sessionId" value={selectedSession.id} />
													<button type="submit" class="btn btn-success">
														Publier (figer les notes)
													</button>
												</form>
											{/if}
											<button
												class="btn btn-ghost"
												onclick={() => (editingSessionId = selectedSession?.id ?? null)}
											>
												Modifier les infos
											</button>
										</div>
									</div>
								</div>

								<!-- Edit Form (inline) -->
								{#if editingSessionId === selectedSession.id}
									<div class="card bg-base-100 shadow">
										<div class="card-body">
											<h4 class="mb-4 text-lg font-bold">Modifier la session</h4>
											<SessionForm
												session={selectedSession}
												oncancel={() => (editingSessionId = null)}
												onsuccess={() => (editingSessionId = null)}
											/>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<!-- Non-active session: show detail view -->
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
										<div class="flex items-center gap-2">
											<SessionStatusBadge status={selectedSession.status} />
											<div class="dropdown dropdown-end">
												<div tabindex="0" role="button" class="btn btn-ghost btn-sm">⋮</div>
												<ul
													tabindex="0"
													class="dropdown-content menu z-10 w-40 rounded-box bg-base-100 p-2 shadow"
												>
													<li>
														<button
															onclick={() => (editingSessionId = selectedSession?.id ?? null)}
														>
															Modifier
														</button>
													</li>
													<li>
														<form method="POST" action="?/deleteSession" use:enhance>
															<input type="hidden" name="sessionId" value={selectedSession.id} />
															<button
																type="submit"
																class="w-full text-left text-error"
																onclick={(e) => {
																	if (!confirm('Supprimer cette session ?')) e.preventDefault();
																}}
															>
																Supprimer
															</button>
														</form>
													</li>
												</ul>
											</div>
										</div>
									</div>

									<!-- Lifecycle Action Button -->
									{#if selectedSession.status !== 'published'}
										{@const nextAction = getNextAction(selectedSession.status)}
										{#if nextAction}
											<form method="POST" action={nextAction.action} use:enhance>
												<input type="hidden" name="sessionId" value={selectedSession.id} />
												<button type="submit" class="btn {nextAction.class} w-full">
													{nextAction.label} la session
												</button>
											</form>
										{/if}
									{/if}

									<!-- Edit Form -->
									{#if editingSessionId === selectedSession.id}
										<div class="border-t border-base-300 pt-4">
											<h4 class="mb-4 text-lg font-bold">Modifier la session</h4>
											<SessionForm
												session={selectedSession}
												oncancel={() => (editingSessionId = null)}
												onsuccess={() => (editingSessionId = null)}
											/>
										</div>
									{:else}
										<!-- Session Content - Collaborative Notes as Summary -->
										<div class="border-t border-base-300 pt-4">
											<h4 class="mb-2 text-lg font-semibold">Résumé / Notes</h4>
											{#key selectedSession.id}
												<CollaborativeEditor
													sessionId={selectedSession.id}
													initialContent={selectedSession.collaborativeContent}
													readonly={selectedSession.status === 'published'}
													{userName}
													onSave={selectedSession.status !== 'published'
														? createSaveHandler(selectedSession.id)
														: undefined}
												/>
											{/key}
										</div>

										{#if selectedSession.privateNotes}
											<div class="rounded-lg border border-warning/30 bg-warning/10 p-4">
												<h4 class="mb-2 text-lg font-semibold text-warning">
													Notes privées (MJ uniquement)
												</h4>
												<p class="whitespace-pre-wrap text-warning/90">
													{selectedSession.privateNotes}
												</p>
											</div>
										{/if}
									{/if}
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
		</div>
	{/if}

	<!-- Players Tab -->
	{#if activeTab === 'players'}
		<PlayerManagement {players} campaignId={campaign.id} {form} />
	{/if}

	<!-- Settings Tab -->
	{#if activeTab === 'settings'}
		<div class="space-y-6">
			{#if form?.error}
				<div class="alert alert-error">
					<span>{form.error}</span>
				</div>
			{/if}

			{#if form?.settingsUpdated}
				<div class="alert alert-success">
					<span>Paramètres mis à jour avec succès</span>
				</div>
			{/if}

			<!-- Campaign Info -->
			<div class="card bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title">Informations de la campagne</h3>
					<form method="POST" action="?/updateCampaign" use:enhance class="space-y-4">
						<div class="form-control w-full">
							<label class="label" for="campaign-name">
								<span class="label-text">Nom de la campagne</span>
							</label>
							<input
								type="text"
								id="campaign-name"
								name="name"
								class="input-bordered input w-full"
								value={campaign.name}
								required
							/>
						</div>

						<div class="form-control w-full">
							<label class="label" for="campaign-universe">
								<span class="label-text">Univers</span>
							</label>
							<input
								type="text"
								id="campaign-universe"
								name="universe"
								class="input-bordered input w-full"
								value={campaign.universe}
							/>
						</div>

						<div class="form-control w-full">
							<label class="label" for="campaign-description">
								<span class="label-text">Description</span>
							</label>
							<textarea
								id="campaign-description"
								name="description"
								class="textarea-bordered textarea w-full"
								rows="4">{campaign.description}</textarea
							>
						</div>

						<div class="flex justify-end pt-4">
							<button type="submit" class="btn btn-primary">Enregistrer les modifications</button>
						</div>
					</form>
				</div>
			</div>

			<!-- Danger Zone -->
			<div class="card border border-error/30 bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title text-error">Zone de danger</h3>
					<p class="text-base-content/60">
						La suppression de la campagne est irréversible. Toutes les sessions et joueurs associés
						seront également supprimés.
					</p>
					<div class="flex justify-end pt-4">
						<form method="POST" action="?/deleteCampaign" use:enhance>
							<button
								type="submit"
								class="btn btn-error"
								onclick={(e) => {
									if (
										!confirm(
											'Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible.'
										)
									)
										e.preventDefault();
								}}
							>
								Supprimer la campagne
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
