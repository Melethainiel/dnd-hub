<script lang="ts">
	import { enhance } from '$app/forms';

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
		<label class="label" for="summary">
			<span class="label-text">📝 Résumé de la session</span>
		</label>
		<textarea
			id="summary"
			name="summary"
			class="textarea-bordered textarea w-full"
			placeholder="Décrivez les événements clés, les actions des joueurs..."
			rows="5"
			required>{session?.summary ?? ''}</textarea
		>
	</div>

	<div class="form-control">
		<label class="label" for="privateNotes">
			<span class="label-text">🔐 Notes privées (MJ uniquement)</span>
		</label>
		<textarea
			id="privateNotes"
			name="privateNotes"
			class="textarea-bordered textarea w-full"
			placeholder="Secrets, plans futurs, jets cachés..."
			rows="4">{session?.privateNotes ?? ''}</textarea
		>
	</div>

	<div class="form-control">
		<label class="label" for="publicNotes">
			<span class="label-text">✏️ Notes publiques (à partager avec les joueurs)</span>
		</label>
		<textarea
			id="publicNotes"
			name="publicNotes"
			class="textarea-bordered textarea w-full"
			placeholder="Informations partagées avec les joueurs..."
			rows="3">{session?.publicNotes ?? ''}</textarea
		>
	</div>

	<div class="form-control rounded-lg bg-base-200 p-4">
		<label class="label cursor-pointer justify-start gap-3">
			<input
				type="checkbox"
				name="isPublished"
				class="checkbox checkbox-primary"
				checked={session?.isPublished ?? false}
			/>
			<span class="label-text">📢 Publier et partager avec les joueurs</span>
		</label>
	</div>

	<div class="border-t pt-4">
		<h4 class="mb-4 font-semibold">🎲 Prochaine session</h4>
		<div class="grid grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label" for="nextSessionDate">
					<span class="label-text">Date prévue</span>
				</label>
				<input
					type="date"
					id="nextSessionDate"
					name="nextSessionDate"
					class="input-bordered input w-full"
					value={formatDateForInput(session?.nextSessionDate ?? null)}
				/>
			</div>
			<div class="form-control">
				<label class="label" for="nextSessionTheme">
					<span class="label-text">Thème/Prérequis</span>
				</label>
				<input
					type="text"
					id="nextSessionTheme"
					name="nextSessionTheme"
					class="input-bordered input w-full"
					placeholder="Thème ou préparation recommandée"
					value={session?.nextSessionTheme ?? ''}
				/>
			</div>
		</div>
	</div>

	<div class="flex gap-3 border-t pt-4">
		<button type="button" class="btn flex-1 btn-outline" onclick={oncancel}> Annuler </button>
		<button type="submit" class="btn flex-1 btn-primary">
			{isEditing ? 'Mettre à jour' : 'Créer la session'}
		</button>
	</div>
</form>
