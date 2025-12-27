<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title justify-center text-2xl">Connexion</h1>

			{#if form?.error}
				<div class="alert alert-error">
					<span>{form.error}</span>
				</div>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="form-control w-full">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						type="email"
						id="email"
						name="email"
						class="input-bordered input w-full"
						required
						autocomplete="email"
					/>
				</div>

				<div class="form-control w-full">
					<label class="label" for="password">
						<span class="label-text">Mot de passe</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						class="input-bordered input w-full"
						required
						autocomplete="current-password"
					/>
				</div>

				<button type="submit" class="btn w-full btn-primary">Se connecter</button>
			</form>

			<div class="divider">ou</div>

			<p class="text-center text-sm">
				Pas encore de compte ?
				<a href="/register" class="link link-primary">Créer un compte</a>
			</p>
		</div>
	</div>
</div>
