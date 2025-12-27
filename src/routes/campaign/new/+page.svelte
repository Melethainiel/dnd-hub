<script lang="ts">
	import { enhance } from '$app/forms';
	import Header from '$lib/components/Header.svelte';

	let { data, form }: { data: any; form: any } = $props();
</script>

<div class="min-h-screen bg-base-200">
	<Header user={data.user} />

	<main class="mx-auto max-w-2xl px-4 py-8">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h1 class="card-title text-2xl">Nouvelle Campagne</h1>

				{#if form?.error}
					<div class="alert alert-error">
						<span>{form.error}</span>
					</div>
				{/if}

				<form method="POST" use:enhance class="space-y-4">
					<div class="form-control w-full">
						<label class="label" for="name">
							<span class="label-text">Nom de la campagne</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							class="input-bordered input w-full"
							placeholder="Ex: Les Cavernes du Désespoir"
							value={form?.name ?? ''}
							required
						/>
					</div>

					<div class="form-control w-full">
						<label class="label" for="universe">
							<span class="label-text">Univers</span>
						</label>
						<input
							type="text"
							id="universe"
							name="universe"
							class="input-bordered input w-full"
							placeholder="Ex: Monde de Faerûn"
							value={form?.universe ?? ''}
						/>
					</div>

					<div class="form-control w-full">
						<label class="label" for="description">
							<span class="label-text">Description</span>
						</label>
						<textarea
							id="description"
							name="description"
							class="textarea-bordered textarea w-full"
							placeholder="Décrivez votre campagne..."
							rows="4"
							value={form?.description ?? ''}
						></textarea>
					</div>

					<div class="flex gap-3 pt-4">
						<a href="/dashboard" class="btn flex-1 btn-outline">Annuler</a>
						<button type="submit" class="btn flex-1 btn-primary">Créer</button>
					</div>
				</form>
			</div>
		</div>
	</main>
</div>
