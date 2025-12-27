<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import CampaignCard from '$lib/components/CampaignCard.svelte';

	let { data } = $props();

	const hasCampaigns = $derived(data.masterCampaigns.length > 0 || data.playerCampaigns.length > 0);
</script>

<div class="min-h-screen bg-base-200">
	<Header user={data.user} />

	<main class="mx-auto max-w-7xl px-4 py-8">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Mes Campagnes</h1>
			<a href="/campaign/new" class="btn btn-primary">+ Nouvelle Campagne</a>
		</div>

		{#if !hasCampaigns}
			<div class="py-12 text-center">
				<p class="mb-4 text-base-content/60">Aucune campagne pour le moment</p>
				<a href="/campaign/new" class="btn btn-primary">Créer votre première campagne</a>
			</div>
		{/if}

		{#if data.masterCampaigns.length > 0}
			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-bold">Campagnes en tant que Maître de Jeu</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.masterCampaigns as campaign}
						<CampaignCard {campaign} role="mj" />
					{/each}
				</div>
			</section>
		{/if}

		{#if data.playerCampaigns.length > 0}
			<section>
				<h2 class="mb-4 text-2xl font-bold">Campagnes en tant que Joueur</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.playerCampaigns as campaign}
						<CampaignCard {campaign} role="player" />
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
