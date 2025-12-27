<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import MJSpace from '$lib/components/MJSpace.svelte';
	import PlayerSpace from '$lib/components/PlayerSpace.svelte';

	let { data, form } = $props();
</script>

<div class="min-h-screen bg-base-200">
	<Header user={data.user} />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<a href="/dashboard" class="btn mb-6 gap-2 btn-ghost btn-sm">
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
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Retour au tableau de bord
		</a>

		{#if data.isMaster}
			<MJSpace
				campaign={data.campaign}
				sessions={data.sessions}
				players={data.players}
				userName={data.user.name}
				{form}
			/>
		{:else if data.isPlayer}
			<PlayerSpace campaign={data.campaign} sessions={data.sessions} userName={data.user.name} />
		{:else}
			<div class="py-12 text-center">
				<p class="text-base-content/60">Accès non autorisé</p>
			</div>
		{/if}
	</main>
</div>
