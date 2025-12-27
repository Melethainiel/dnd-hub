<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title justify-center text-2xl">Créer un compte</h1>

			{#if form?.error}
				<div class="alert alert-error">
					<span>{form.error}</span>
				</div>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="form-control w-full">
					<label class="label" for="name">
						<span class="label-text">Nom</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						class="input-bordered input w-full"
						required
						autocomplete="name"
					/>
				</div>

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
						minlength="8"
						autocomplete="new-password"
					/>
				</div>

				<div class="form-control w-full">
					<label class="label" for="confirmPassword">
						<span class="label-text">Confirmer le mot de passe</span>
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						class="input-bordered input w-full"
						required
						minlength="8"
						autocomplete="new-password"
					/>
				</div>

				<button type="submit" class="btn w-full btn-primary">Créer le compte</button>
			</form>

			<div class="divider">ou</div>

			<p class="text-center text-sm">
				Déjà un compte ?
				<a href="/login" class="link link-primary">Se connecter</a>
			</p>
		</div>
	</div>
</div>
