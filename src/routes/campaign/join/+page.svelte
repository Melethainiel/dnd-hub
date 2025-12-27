<script lang="ts">
	import { enhance } from '$app/forms';
	import Header from '$lib/components/Header.svelte';

	let { data, form } = $props();
</script>

<div class="min-h-screen bg-base-200">
	<Header user={data.user} />

	<main class="mx-auto max-w-md px-4 py-8">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h1 class="card-title text-2xl">Rejoindre une campagne</h1>
				<p class="text-base-content/60">Entrez le code d'invitation fourni par le Maître de Jeu</p>

				{#if form?.error}
					<div class="alert alert-error">
						<span>{form.error}</span>
					</div>
				{/if}

				<form method="POST" use:enhance class="space-y-4">
					<div class="form-control w-full">
						<label class="label" for="code">
							<span class="label-text">Code d'invitation</span>
						</label>
						<input
							type="text"
							id="code"
							name="code"
							class="input-bordered input w-full text-center font-mono text-lg tracking-wider uppercase"
							placeholder="XXXXXXXX"
							maxlength="8"
							value={form?.code ?? ''}
							required
						/>
					</div>

					<div class="flex gap-3 pt-4">
						<a href="/dashboard" class="btn flex-1 btn-outline">Annuler</a>
						<button type="submit" class="btn flex-1 btn-primary">Rejoindre</button>
					</div>
				</form>
			</div>
		</div>
	</main>
</div>
