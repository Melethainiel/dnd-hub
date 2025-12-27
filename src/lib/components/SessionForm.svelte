<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SessionStatus } from '$lib/server/db/schema';

	interface Session {
		id: string;
		number: number;
		title: string;
		status: SessionStatus;
		sessionDate: Date;
		privateNotes: string;
	}

	let {
		session = null,
		nextNumber = 1,
		oncancel,
		onsuccess
	}: {
		session?: Session | null;
		nextNumber?: number;
		oncancel: () => void;
		onsuccess: () => void;
	} = $props();

	let isEditing = $derived(!!session);
	let actionUrl = $derived(isEditing ? '?/updateSession' : '?/createSession');

	// Only show extended fields when editing an existing session (not for new scheduling)
	let showExtendedFields = $derived(isEditing && session?.status !== 'scheduled');

	function formatDateForInput(date: Date | null): string {
		if (!date) return '';
		const d = new Date(date);
		return d.toISOString().split('T')[0];
	}
</script>

<form
	method="POST"
	action={actionUrl}
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				onsuccess();
			}
			await update();
		};
	}}
	class="space-y-4"
>
	{#if isEditing}
		<input type="hidden" name="sessionId" value={session?.id} />
	{/if}

	<div class="grid grid-cols-2 gap-4">
		<div class="form-control">
			<label class="label" for="number">
				<span class="label-text">Numéro de session</span>
			</label>
			<input
				type="number"
				id="number"
				name="number"
				min="1"
				class="input-bordered input w-full"
				value={session?.number ?? nextNumber}
				required
			/>
		</div>
		<div class="form-control">
			<label class="label" for="sessionDate">
				<span class="label-text">Date de la session</span>
			</label>
			<input
				type="date"
				id="sessionDate"
				name="sessionDate"
				class="input-bordered input w-full"
				value={formatDateForInput(session?.sessionDate ?? new Date())}
				required
			/>
		</div>
	</div>

	<div class="form-control">
		<label class="label" for="title">
			<span class="label-text">Titre / Thème (optionnel)</span>
		</label>
		<input
			type="text"
			id="title"
			name="title"
			class="input-bordered input w-full"
			placeholder="Ex: La crypte oubliée, Combat final..."
			value={session?.title ?? ''}
		/>
	</div>

	{#if showExtendedFields}
		<div class="form-control">
			<label class="label" for="privateNotes">
				<span class="label-text">Notes privées (MJ uniquement)</span>
			</label>
			<textarea
				id="privateNotes"
				name="privateNotes"
				class="textarea-bordered textarea w-full"
				placeholder="Secrets, plans futurs, jets cachés..."
				rows="3">{session?.privateNotes ?? ''}</textarea
			>
		</div>
	{/if}

	<div class="flex gap-3 border-t border-base-300 pt-4">
		<button type="button" class="btn flex-1 btn-outline" onclick={oncancel}> Annuler </button>
		<button type="submit" class="btn flex-1 btn-primary">
			{isEditing ? 'Mettre à jour' : 'Planifier la session'}
		</button>
	</div>
</form>
