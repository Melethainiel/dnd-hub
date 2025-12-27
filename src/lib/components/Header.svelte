<script lang="ts">
	import type { SessionUser } from '$lib/server/auth/session';
	import { getLocale, locales, setLocale, type Locale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';

	type Props = {
		user: SessionUser;
	};

	let { user }: Props = $props();

	let currentLocale = $derived(getLocale());
	let dropdownOpen = $state(false);

	type Theme = 'light' | 'dark' | 'system';
	let currentTheme = $state<Theme>('system');

	// Load theme from localStorage on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('theme') as Theme | null;
			if (stored && ['light', 'dark', 'system'].includes(stored)) {
				currentTheme = stored;
				applyTheme(stored);
			}
		}
	});

	function applyTheme(theme: Theme) {
		if (theme === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
		} else {
			document.documentElement.setAttribute('data-theme', theme);
		}
	}

	function setTheme(theme: Theme) {
		currentTheme = theme;
		localStorage.setItem('theme', theme);
		applyTheme(theme);
	}

	function getLanguageLabel(locale: string): string {
		return locale === 'fr' ? 'Français' : 'English';
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

	function changeLocale(locale: Locale) {
		closeDropdown();
		// setLocale with cookie strategy requires page reload to take effect
		setLocale(locale);
	}

	function getThemeLabel(theme: Theme): string {
		switch (theme) {
			case 'light':
				return m.header_theme_light();
			case 'dark':
				return m.header_theme_dark();
			case 'system':
				return m.header_theme_system();
		}
	}
</script>

<header class="navbar bg-base-100 shadow">
	<div class="mx-auto flex w-full max-w-7xl justify-between px-4">
		<a href="/dashboard" class="btn text-xl btn-ghost">CampaignHub</a>

		<div class="flex items-center gap-2">
			<!-- User Dropdown -->
			<div class="dropdown dropdown-end">
				<button
					class="btn gap-2 btn-ghost"
					onclick={() => (dropdownOpen = !dropdownOpen)}
					aria-haspopup="true"
					aria-expanded={dropdownOpen}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					<span class="hidden sm:inline">{user.name}</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{#if dropdownOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="fixed inset-0 z-10"
						onclick={closeDropdown}
						onkeydown={(e) => e.key === 'Escape' && closeDropdown()}
					></div>
					<div class="dropdown-content menu z-20 mt-2 w-64 rounded-box bg-base-200 p-4 shadow-lg">
						<!-- User Info -->
						<div class="mb-4 border-b border-base-300 pb-4">
							<p class="font-semibold">{user.name}</p>
							<p class="text-sm text-base-content/60">{user.email}</p>
							<a
								href="/profile"
								class="mt-2 inline-block text-sm text-primary hover:underline"
								onclick={closeDropdown}
							>
								{m.header_profile()}
							</a>
						</div>

						<!-- Language Section -->
						<div class="mb-4">
							<p class="mb-2 text-sm font-semibold text-base-content/70">{m.header_language()}</p>
							<div class="flex gap-2">
								{#each locales as locale}
									<button
										class="btn flex-1 btn-sm"
										class:btn-primary={currentLocale === locale}
										class:btn-outline={currentLocale !== locale}
										onclick={() => changeLocale(locale)}
									>
										{getLanguageLabel(locale)}
									</button>
								{/each}
							</div>
						</div>

						<!-- Theme Section -->
						<div class="mb-4">
							<p class="mb-2 text-sm font-semibold text-base-content/70">{m.header_theme()}</p>
							<div class="flex gap-2">
								{#each ['light', 'dark', 'system'] as theme}
									<button
										class="btn flex-1 btn-sm"
										class:btn-primary={currentTheme === theme}
										class:btn-outline={currentTheme !== theme}
										onclick={() => setTheme(theme as Theme)}
									>
										{getThemeLabel(theme as Theme)}
									</button>
								{/each}
							</div>
						</div>

						<!-- Logout -->
						<div class="border-t border-base-300 pt-4">
							<form action="/logout" method="POST">
								<button type="submit" class="btn w-full btn-outline btn-sm btn-error">
									{m.header_logout()}
								</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
