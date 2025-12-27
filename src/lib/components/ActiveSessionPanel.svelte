<script lang="ts">
	import SessionStatusBadge from './SessionStatusBadge.svelte';
	import CollaborativeEditor from './CollaborativeEditor.svelte';

	interface Session {
		id: string;
		number: number;
		title: string;
		status: 'scheduled' | 'active' | 'completed' | 'published';
		sessionDate: Date;
		collaborativeContent: string;
	}

	let {
		session,
		userName = 'Anonyme',
		onSave
	}: {
		session: Session;
		userName?: string;
		onSave?: (content: string) => void;
	} = $props();

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	// Editor is readonly when session is published
	let isEditable = $derived(session.status === 'active' || session.status === 'completed');
</script>

<div class="card bg-base-100 shadow-lg">
	<div class="card-body">
		<div class="flex items-center justify-between">
			<h3 class="card-title">
				Session #{session.number}
				{#if session.title}
					<span class="text-base font-normal text-base-content/70">— {session.title}</span>
				{/if}
			</h3>
			<SessionStatusBadge status={session.status} />
		</div>

		<p class="text-sm text-base-content/60">{formatDate(session.sessionDate)}</p>

		<!-- Collaborative Editor -->
		<div class="mt-4">
			{#if isEditable}
				<p class="mb-2 text-sm text-base-content/60">
					Notes collaboratives - tous les participants peuvent éditer en temps réel
				</p>
			{:else}
				<p class="mb-2 text-sm text-base-content/60">Notes de session (lecture seule)</p>
			{/if}

			<CollaborativeEditor
				sessionId={session.id}
				initialContent={session.collaborativeContent}
				readonly={!isEditable}
				{userName}
				{onSave}
			/>
		</div>
	</div>
</div>
