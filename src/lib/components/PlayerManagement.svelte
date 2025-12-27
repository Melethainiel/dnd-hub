<script lang="ts">
	import { enhance } from '$app/forms';

	interface Player {
		id: string;
		userId: string;
		name: string;
		email: string;
		joinedAt: Date;
	}

	let { players, campaignId }: { players: Player[]; campaignId: string } = $props();

	let showInvite = $state(false);
	let inviteEmail = $state('');

	// Generate invite code from campaign ID (first 8 chars uppercase)
	let inviteCode = $derived(campaignId.substring(0, 8).toUpperCase());

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR');
	}

	function copyInviteCode() {
		navigator.clipboard.writeText(inviteCode);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h3 class="flex items-center gap-2 text-xl font-bold">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1"
				/>
			</svg>
			Gestion des joueurs
		</h3>
		<button class="btn gap-2 btn-primary" onclick={() => (showInvite = !showInvite)}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Inviter un joueur
		</button>
	</div>

	<!-- Invite Section -->
	{#if showInvite}
		<div class="card bg-base-100 shadow">
			<div class="card-body space-y-4">
				<h4 class="card-title">Inviter un joueur</h4>

				<!-- Option 1: Invite Code -->
				<div>
					<h5 class="mb-2 font-semibold">Option 1: Partager le code d'invitation</h5>
					<div class="flex gap-2">
						<input
							type="text"
							value={inviteCode}
							readonly
							class="input-bordered input flex-1 text-center font-mono"
						/>
						<button class="btn gap-2 btn-primary" onclick={copyInviteCode}>
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
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
							Copier
						</button>
					</div>
				</div>

				<!-- Option 2: Invite by Email -->
				<div>
					<h5 class="mb-2 font-semibold">Option 2: Inviter par email</h5>
					<form
						method="POST"
						action="?/invitePlayer"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									inviteEmail = '';
									showInvite = false;
								}
								await update();
							};
						}}
						class="flex gap-2"
					>
						<input
							type="email"
							name="email"
							bind:value={inviteEmail}
							placeholder="email@exemple.com"
							class="input-bordered input flex-1"
							required
						/>
						<button type="submit" class="btn btn-primary"> Inviter </button>
					</form>
				</div>

				<button class="btn w-full btn-ghost" onclick={() => (showInvite = false)}> Fermer </button>
			</div>
		</div>
	{/if}

	<!-- Players Table -->
	<div class="card bg-base-100 shadow">
		{#if players.length === 0}
			<div class="card-body py-12 text-center">
				<p class="text-base-content/60">Aucun joueur pour le moment</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>Joueur</th>
							<th>Email</th>
							<th>Rejoint le</th>
							<th class="text-center">Action</th>
						</tr>
					</thead>
					<tbody>
						{#each players as player (player.id)}
							<tr class="hover">
								<td class="font-medium">{player.name}</td>
								<td class="text-base-content/60">{player.email}</td>
								<td class="text-base-content/60">{formatDate(player.joinedAt)}</td>
								<td class="text-center">
									<form method="POST" action="?/removePlayer" use:enhance>
										<input type="hidden" name="playerId" value={player.id} />
										<button
											type="submit"
											class="btn text-error btn-ghost btn-sm"
											title="Retirer le joueur"
											onclick={(e) => {
												if (!confirm(`Retirer ${player.name} de la campagne ?`)) e.preventDefault();
											}}
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
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
