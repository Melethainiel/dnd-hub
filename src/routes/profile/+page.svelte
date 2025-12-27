<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let saving = $state(false);
	let showSuccess = $state(false);

	function handleSubmit() {
		saving = true;
		showSuccess = false;
		return async ({
			result,
			update
		}: {
			result: { type: string };
			update: () => Promise<void>;
		}) => {
			saving = false;
			if (result.type === 'success') {
				showSuccess = true;
				setTimeout(() => (showSuccess = false), 3000);
			}
			await update();
		};
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	}
</script>

<div class="min-h-screen bg-base-200">
	<Header user={data.user} />

	<main class="mx-auto max-w-2xl px-4 py-8">
		<h1 class="mb-8 text-3xl font-bold">{m.profile_title()}</h1>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<form method="POST" use:enhance={handleSubmit}>
					<div class="form-control mb-4">
						<label class="label" for="name">
							<span class="label-text">{m.profile_name()}</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={data.user.name}
							class="input-bordered input"
							required
							maxlength="100"
						/>
					</div>

					<div class="form-control mb-4">
						<label class="label" for="email">
							<span class="label-text">{m.profile_email()}</span>
						</label>
						<input
							type="email"
							id="email"
							value={data.user.email}
							class="input-bordered input"
							disabled
						/>
						<label class="label">
							<span class="label-text-alt text-base-content/50">
								{m.profile_member_since()}: {formatDate(data.user.createdAt)}
							</span>
						</label>
					</div>

					{#if form?.error}
						<div class="mb-4 alert alert-error">
							<span>{form.error}</span>
						</div>
					{/if}

					{#if showSuccess}
						<div class="mb-4 alert alert-success">
							<span>{m.profile_saved()}</span>
						</div>
					{/if}

					<div class="card-actions justify-end">
						<button type="submit" class="btn btn-primary" disabled={saving}>
							{#if saving}
								<span class="loading loading-sm loading-spinner"></span>
								{m.profile_saving()}
							{:else}
								{m.profile_save()}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</main>
</div>
