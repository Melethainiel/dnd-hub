<script lang="ts">
	import { enhance } from '$app/forms';
	import SessionForm from './SessionForm.svelte';
	import PlayerManagement from './PlayerManagement.svelte';

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
		privateNotes: string;
		publicNotes: string;
		isPublished: boolean;
		nextSessionDate: Date | null;
		nextSessionTheme: string;
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
		form
	}: { campaign: Campaign; sessions: Session[]; players: Player[]; form: ActionResult | null } =
		$props();

	let activeTab = $state<'sessions' | 'players' | 'settings'>('sessions');
	let showNewSession = $state(false);
	let editingSessionId = $state<string | null>(null);
	let selectedSessionId = $state<string | null>(null);

	let selectedSession = $derived(sessions.find((s) => s.id === selectedSessionId) ?? null);

	// Auto-select first session on mount or when sessions change
	$effect(() => {
		if (
			sessions.length > 0 &&
			(!selectedSessionId || !sessions.find((s) => s.id === selectedSessionId))
		) {
			selectedSessionId = sessions[0].id;
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

	<!-- Tabs -->
	<div role="tablist" class="tabs-boxed tabs w-fit">
		<button
			role="tab"
			class="tab gap-2"
			class:tab-active={activeTab === 'sessions'}
			onclick={() => (activeTab = 'sessions')}
		>
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
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			Sessions
		</button>
		<button
			role="tab"
			class="tab gap-2"
			class:tab-active={activeTab === 'players'}
			onclick={() => (activeTab = 'players')}
		>
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
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
			Joueurs ({players.length})
		</button>
		<button
			role="tab"
			class="tab gap-2"
			class:tab-active={activeTab === 'settings'}
			onclick={() => (activeTab = 'settings')}
		>
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
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
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

			<div class="flex items-center justify-between">
				<h3 class="text-xl font-bold">Gestion des Sessions</h3>
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
					Nouvelle Session
				</button>
			</div>

			<!-- New Session Form -->
			{#if showNewSession}
				<div class="card bg-base-100 shadow">
					<div class="card-body">
						<h4 class="card-title">Créer une nouvelle session</h4>
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
							{#if sessions.length === 0}
								<p class="text-base-content/60">Aucune session pour le moment</p>
							{:else}
								<div class="space-y-2">
									{#each sessions as session (session.id)}
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
								<div class="flex items-start justify-between">
									<div>
										<h3 class="text-2xl font-bold">Session {selectedSession.number}</h3>
										<p class="text-base-content/60">{formatDate(selectedSession.sessionDate)}</p>
									</div>
									<div class="flex gap-2">
										{#if selectedSession.isPublished}
											<span class="badge badge-success">Publiée</span>
										{/if}
										<button
											class="btn btn-ghost btn-sm"
											onclick={() => (editingSessionId = selectedSession?.id ?? null)}
										>
											Éditer
										</button>
										<form method="POST" action="?/deleteSession" use:enhance>
											<input type="hidden" name="sessionId" value={selectedSession.id} />
											<button
												type="submit"
												class="btn text-error btn-ghost btn-sm"
												onclick={(e) => {
													if (!confirm('Supprimer cette session ?')) e.preventDefault();
												}}
											>
												Supprimer
											</button>
										</form>
									</div>
								</div>

								<!-- Edit Form or Content -->
								{#if editingSessionId === selectedSession.id}
									<div class="border-t pt-4">
										<h4 class="mb-4 text-lg font-bold">Éditer la session</h4>
										<SessionForm
											session={selectedSession}
											oncancel={() => (editingSessionId = null)}
											onsuccess={() => (editingSessionId = null)}
										/>
									</div>
								{:else}
									<!-- Summary -->
									<div class="border-t pt-4">
										<h4 class="mb-2 text-lg font-semibold">Résumé</h4>
										<p class="whitespace-pre-wrap">
											{selectedSession.summary || 'Aucun résumé'}
										</p>
									</div>

									<!-- Private Notes -->
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

									<!-- Public Notes -->
									{#if selectedSession.publicNotes}
										<div class="border-t pt-4">
											<h4 class="mb-2 text-lg font-semibold">Notes publiques</h4>
											<p class="whitespace-pre-wrap">
												{selectedSession.publicNotes}
											</p>
										</div>
									{/if}

									<!-- Next Session -->
									{#if selectedSession.nextSessionTheme}
										<div class="rounded-lg border border-info/30 bg-info/10 p-4">
											<h4 class="mb-2 text-lg font-semibold text-info">Prochaine session</h4>
											<p class="text-info/90">{selectedSession.nextSessionTheme}</p>
											{#if selectedSession.nextSessionDate}
												<p class="mt-2 text-sm text-info/70">
													Prévue le {formatShortDate(selectedSession.nextSessionDate)}
												</p>
											{/if}
										</div>
									{/if}
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
