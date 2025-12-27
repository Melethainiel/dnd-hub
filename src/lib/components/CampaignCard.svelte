<script lang="ts">
	import type { campaigns } from '$lib/server/db/schema';

	type Campaign = typeof campaigns.$inferSelect;

	type Props = {
		campaign: Campaign;
		role: 'mj' | 'player';
	};

	let { campaign, role }: Props = $props();

	const formatDate = (date: Date) =>
		new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
</script>

<a
	href="/campaign/{campaign.id}"
	class="card bg-base-100 shadow-md transition-shadow hover:shadow-xl"
>
	<div class="card-body">
		<h3 class="card-title">{campaign.name}</h3>
		<p class="text-sm text-base-content/60">{campaign.universe || 'Univers non défini'}</p>

		<p class="line-clamp-2 text-sm">{campaign.description || 'Aucune description'}</p>

		<div class="mt-4 card-actions items-center justify-between">
			<span class="badge {role === 'mj' ? 'badge-primary' : 'badge-secondary'}">
				{role === 'mj' ? 'Maître de Jeu' : 'Joueur'}
			</span>
			<span class="text-xs text-base-content/50">{formatDate(campaign.updatedAt)}</span>
		</div>
	</div>
</a>
