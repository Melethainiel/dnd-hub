<script lang="ts">
	import type { SessionUser } from '$lib/server/auth/session';

	type Props = {
		user: SessionUser;
	};

	let { user }: Props = $props();
</script>

<header class="navbar bg-base-100 shadow">
	<div class="mx-auto flex w-full max-w-7xl justify-between px-4">
		<a href="/dashboard" class="btn text-xl btn-ghost">CampaignHub</a>
		<div class="flex items-center gap-4">
			<span class="text-sm">{user.name}</span>
			<form action="/logout" method="POST">
				<button type="submit" class="btn btn-ghost btn-sm">Déconnexion</button>
			</form>
		</div>
	</div>
</header>
