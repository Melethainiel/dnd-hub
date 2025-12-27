<script lang="ts">
	import type { SessionStatus } from '$lib/server/db/schema';

	let { status }: { status: SessionStatus } = $props();

	const statusConfig = {
		scheduled: { class: 'badge-info', label: 'Planifiée' },
		active: { class: 'badge-warning', label: 'En cours' },
		completed: { class: 'badge-accent', label: 'Terminée' },
		published: { class: 'badge-success', label: 'Publiée' }
	} as const;

	const config = $derived(statusConfig[status]);
</script>

<span class="badge {config.class} badge-sm">{config.label}</span>
