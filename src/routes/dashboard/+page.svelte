<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import CampaignCard from '$lib/components/CampaignCard.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	const hasCampaigns = $derived(data.masterCampaigns.length > 0 || data.playerCampaigns.length > 0);
</script>

<div class="min-h-screen bg-base-200">
	<Header user={data.user} />

	<main class="mx-auto max-w-7xl px-4 py-8">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold">{m.dashboard_title()}</h1>
			<div class="flex gap-2">
				<a href="/campaign/join" class="btn btn-outline">{m.dashboard_join_campaign()}</a>
				<a href="/campaign/new" class="btn btn-primary">{m.dashboard_new_campaign()}</a>
			</div>
		</div>

		{#if !hasCampaigns}
			<div class="py-12 text-center">
				<p class="mb-4 text-base-content/60">{m.dashboard_no_campaigns()}</p>
				<a href="/campaign/new" class="btn btn-primary">{m.dashboard_create_first()}</a>
			</div>
		{/if}

		{#if data.masterCampaigns.length > 0}
			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-bold">{m.dashboard_as_gm()}</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.masterCampaigns as campaign}
						<CampaignCard {campaign} role="mj" />
					{/each}
				</div>
			</section>
		{/if}

		{#if data.playerCampaigns.length > 0}
			<section>
				<h2 class="mb-4 text-2xl font-bold">{m.dashboard_as_player()}</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.playerCampaigns as campaign}
						<CampaignCard {campaign} role="player" />
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
