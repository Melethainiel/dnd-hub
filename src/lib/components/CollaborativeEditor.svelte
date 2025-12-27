<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, rootCtx, editorViewOptionsCtx } from '@milkdown/kit/core';
	import { getMarkdown, $inputRule as inputRule } from '@milkdown/kit/utils';
	import { commonmark, insertImageInputRule, linkSchema } from '@milkdown/kit/preset/commonmark';
	import { gfm } from '@milkdown/kit/preset/gfm';
	import { history } from '@milkdown/kit/plugin/history';
	import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
	import { nord } from '@milkdown/theme-nord';
	import { InputRule } from '@milkdown/kit/prose/inputrules';
	import * as Y from 'yjs';
	import { WebsocketProvider } from 'y-websocket';

	// Custom input rule for markdown links: [text](url)
	const insertLinkInputRule = inputRule(
		(ctx) =>
			new InputRule(/\[(?<text>[^\]]+)]\((?<url>[^)]+)\)$/, (state, match, start, end) => {
				const [, text, url] = match;
				if (!text || !url) return null;

				const linkMark = linkSchema.type(ctx).create({ href: url });
				const textNode = state.schema.text(text, [linkMark]);
				return state.tr.replaceWith(start, end, textNode);
			})
	);

	// Required CSS for proper styling
	import '@milkdown/theme-nord/style.css';
	import '@milkdown/kit/prose/tables/style/tables.css';

	interface Props {
		sessionId: string;
		initialContent?: string;
		readonly?: boolean;
		userName?: string;
		onSave?: (content: string) => void;
	}

	let {
		sessionId,
		initialContent = '',
		readonly = false,
		userName = 'Anonyme',
		onSave
	}: Props = $props();

	let editorElement: HTMLDivElement;
	let editor: Editor | null = $state(null);
	let ydoc: Y.Doc | null = null;
	let wsProvider: WebsocketProvider | null = null;
	let connectionStatus = $state<'connecting' | 'connected' | 'disconnected'>('connecting');
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let isSaving = $state(false);
	let lastSavedContent = '';

	// Connected users tracking
	interface ConnectedUser {
		id: number;
		name: string;
		color: string;
	}
	let connectedUsers = $state<ConnectedUser[]>([]);

	const WS_URL = 'ws://localhost:1234';
	const SAVE_DEBOUNCE_MS = 2000; // Save 2 seconds after last change

	// Generate a consistent color from a string
	function stringToColor(str: string): string {
		const colors = [
			'#ef4444',
			'#f97316',
			'#eab308',
			'#22c55e',
			'#14b8a6',
			'#3b82f6',
			'#8b5cf6',
			'#ec4899',
			'#f43f5e',
			'#06b6d4'
		];
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}

	// Get initials from name
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Update connected users from awareness
	function updateConnectedUsers() {
		if (!wsProvider) return;

		const states = wsProvider.awareness.getStates();
		const users: ConnectedUser[] = [];

		states.forEach((state, clientId) => {
			if (state.user) {
				users.push({
					id: clientId,
					name: state.user.name || 'Anonyme',
					color: state.user.color || stringToColor(state.user.name || 'Anonyme')
				});
			}
		});

		connectedUsers = users;
	}

	// Get current markdown content from editor
	function getCurrentMarkdown(): string {
		if (!editor) return '';
		return editor.action(getMarkdown());
	}

	// Save content with debounce
	function scheduleSave() {
		if (readonly || !onSave) return;

		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(() => {
			const content = getCurrentMarkdown();
			// Only save if content actually changed
			if (content !== lastSavedContent) {
				isSaving = true;
				lastSavedContent = content;
				onSave(content);
				// Reset saving indicator after a short delay
				setTimeout(() => {
					isSaving = false;
				}, 500);
			}
		}, SAVE_DEBOUNCE_MS);
	}

	onMount(async () => {
		// Create Yjs document
		ydoc = new Y.Doc();

		// Connect to WebSocket server with session-specific room
		wsProvider = new WebsocketProvider(WS_URL, `session-${sessionId}`, ydoc);

		// Set local user info in awareness
		const userColor = stringToColor(userName);
		wsProvider.awareness.setLocalStateField('user', {
			name: userName,
			color: userColor
		});

		wsProvider.on('status', (event: { status: string }) => {
			connectionStatus = event.status as 'connecting' | 'connected' | 'disconnected';
		});

		// Track awareness changes for connected users
		wsProvider.awareness.on('change', updateConnectedUsers);
		updateConnectedUsers();

		// Create Milkdown editor
		editor = await Editor.make()
			.config((ctx) => {
				ctx.set(rootCtx, editorElement);
				ctx.update(editorViewOptionsCtx, (prev) => ({
					...prev,
					editable: () => !readonly,
					attributes: {
						class: 'milkdown-editor prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
						spellcheck: 'false'
					},
					// Handle Ctrl/Cmd + Click on links
					handleClick: (view, pos, event) => {
						if (event.ctrlKey || event.metaKey) {
							const { state } = view;
							const resolvedPos = state.doc.resolve(pos);
							const node = resolvedPos.parent.maybeChild(resolvedPos.index());
							if (node) {
								const linkMark = node.marks.find((mark) => mark.type.name === 'link');
								if (linkMark?.attrs?.href) {
									window.open(linkMark.attrs.href, '_blank', 'noopener,noreferrer');
									return true;
								}
							}
						}
						return false;
					}
				}));
			})
			.config(nord)
			.use(commonmark)
			.use(gfm)
			.use(insertImageInputRule)
			.use(insertLinkInputRule)
			.use(history)
			.use(collab)
			.create();

		// Connect Yjs collaboration with custom cursor styling
		editor.action((ctx) => {
			const collabService = ctx.get(collabServiceCtx);

			// Custom cursor builder - thin vertical line with small name label
			const cursorBuilder = (user: { name: string; color: string }): HTMLElement => {
				const cursor = document.createElement('span');
				cursor.classList.add('yjs-cursor');
				cursor.style.borderLeft = `2px solid ${user.color}`;
				cursor.style.marginLeft = '-1px';
				cursor.style.marginRight = '-1px';
				cursor.style.position = 'relative';
				cursor.style.pointerEvents = 'none';

				const label = document.createElement('div');
				label.textContent = user.name;
				label.style.position = 'absolute';
				label.style.top = '-1.4em';
				label.style.left = '-2px';
				label.style.fontSize = '0.6rem';
				label.style.fontWeight = '500';
				label.style.lineHeight = '1';
				label.style.padding = '2px 4px';
				label.style.borderRadius = '3px';
				label.style.whiteSpace = 'nowrap';
				label.style.color = 'white';
				label.style.backgroundColor = user.color;
				label.style.opacity = '0.85';
				label.style.pointerEvents = 'none';
				label.style.userSelect = 'none';

				// Add non-breaking spaces for proper cursor positioning
				cursor.appendChild(document.createTextNode('\u2060'));
				cursor.appendChild(label);
				cursor.appendChild(document.createTextNode('\u2060'));

				return cursor;
			};

			// Custom selection builder - very subtle highlight
			const selectionBuilder = (user: { name: string; color: string }) => ({
				style: `background-color: ${user.color}25`, // 25 hex = ~15% opacity
				class: 'yjs-selection'
			});

			collabService
				.bindDoc(ydoc!)
				.setOptions({
					yCursorOpts: {
						cursorBuilder,
						selectionBuilder
					}
				})
				.setAwareness(wsProvider!.awareness);

			// Handle initial sync - load content from DB if Yjs doc is empty
			const handleSync = (isSynced: boolean) => {
				if (isSynced) {
					collabService.connect();

					// After connecting, check if doc is empty and we have initial content
					const xmlFragment = ydoc!.getXmlFragment('prosemirror');
					const isEmpty = xmlFragment.length === 0;

					if (isEmpty && initialContent && initialContent.trim()) {
						// Apply initial content as template
						collabService.applyTemplate(initialContent);
					}

					// Initialize lastSavedContent
					lastSavedContent = getCurrentMarkdown();

					// Listen for changes to trigger save
					if (!readonly && onSave) {
						ydoc!.on('update', scheduleSave);
					}
				}
			};

			// @ts-expect-error - y-websocket types are incomplete, 'synced' event exists
			wsProvider!.once('synced', handleSync);

			if (wsProvider!.synced) {
				handleSync(true);
			}
		});
	});

	onDestroy(() => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			// Save immediately on destroy if there are pending changes
			if (!readonly && onSave) {
				const content = getCurrentMarkdown();
				if (content !== lastSavedContent) {
					onSave(content);
				}
			}
		}
		if (ydoc && !readonly && onSave) {
			ydoc.off('update', scheduleSave);
		}
		wsProvider?.awareness.off('change', updateConnectedUsers);
		editor?.destroy();
		wsProvider?.destroy();
		ydoc?.destroy();
	});
</script>

<div class="collaborative-editor">
	<!-- Status bar -->
	<div class="mb-2 flex items-center justify-between text-sm">
		<!-- Connection status -->
		<div class="flex items-center gap-2">
			<span
				class="inline-block h-2 w-2 rounded-full"
				class:bg-success={connectionStatus === 'connected'}
				class:bg-warning={connectionStatus === 'connecting'}
				class:bg-error={connectionStatus === 'disconnected'}
			></span>
			<span class="text-base-content/60">
				{#if connectionStatus === 'connected'}
					Connecté
				{:else if connectionStatus === 'connecting'}
					Connexion...
				{:else}
					Déconnecté
				{/if}
			</span>
		</div>

		<!-- Connected users -->
		{#if connectedUsers.length > 0}
			<div class="flex items-center gap-1">
				<div class="avatar-group -space-x-3 rtl:space-x-reverse">
					{#each connectedUsers.slice(0, 4) as user (user.id)}
						<div class="placeholder tooltip avatar tooltip-bottom" data-tip={user.name}>
							<div
								class="flex h-7 w-7 items-center justify-center rounded-full text-xs text-neutral-content"
								style="background-color: {user.color}"
							>
								<span>{getInitials(user.name)}</span>
							</div>
						</div>
					{/each}
					{#if connectedUsers.length > 4}
						<div class="placeholder avatar">
							<div
								class="flex h-7 w-7 items-center justify-center rounded-full bg-neutral text-xs text-neutral-content"
							>
								<span>+{connectedUsers.length - 4}</span>
							</div>
						</div>
					{/if}
				</div>
				<span class="ml-2 text-xs text-base-content/50">
					{connectedUsers.length} en ligne
				</span>
			</div>
		{/if}
	</div>

	<!-- Editor container -->
	<div
		bind:this={editorElement}
		class="rounded-lg border border-base-300 bg-base-100"
		class:opacity-60={readonly}
	></div>
</div>

<style>
	:global(.collaborative-editor .milkdown) {
		min-height: 200px;
	}

	:global(.collaborative-editor .milkdown-editor) {
		padding: 1rem;
	}

	:global(.collaborative-editor .milkdown-editor:focus) {
		outline: none;
	}

	/* Headings */
	:global(.collaborative-editor .milkdown h1) {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 1rem 0 0.5rem;
	}

	:global(.collaborative-editor .milkdown h2) {
		font-size: 1.25rem;
		font-weight: bold;
		margin: 0.75rem 0 0.5rem;
	}

	:global(.collaborative-editor .milkdown h3) {
		font-size: 1.1rem;
		font-weight: bold;
		margin: 0.5rem 0 0.25rem;
	}

	/* Paragraphs and lists */
	:global(.collaborative-editor .milkdown p) {
		margin: 0.5rem 0;
	}

	:global(.collaborative-editor .milkdown ul),
	:global(.collaborative-editor .milkdown ol) {
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	:global(.collaborative-editor .milkdown blockquote) {
		border-left: 3px solid #ccc;
		padding-left: 1rem;
		margin: 0.5rem 0;
		color: #666;
	}

	/* Tables - GFM style */
	:global(.collaborative-editor .milkdown table) {
		border-collapse: collapse;
		width: 100%;
		margin: 1rem 0;
	}

	:global(.collaborative-editor .milkdown th),
	:global(.collaborative-editor .milkdown td) {
		border: 1px solid oklch(var(--bc) / 0.2);
		padding: 0.5rem;
		text-align: left;
	}

	:global(.collaborative-editor .milkdown th) {
		background-color: oklch(var(--b2));
		font-weight: 600;
	}

	:global(.collaborative-editor .milkdown tr:nth-child(even)) {
		background-color: oklch(var(--b2) / 0.5);
	}

	/* Code blocks */
	:global(.collaborative-editor .milkdown pre) {
		background-color: oklch(var(--b2));
		border-radius: 0.375rem;
		padding: 1rem;
		overflow-x: auto;
		margin: 0.5rem 0;
	}

	:global(.collaborative-editor .milkdown code) {
		font-family: monospace;
		font-size: 0.875rem;
	}

	:global(.collaborative-editor .milkdown :not(pre) > code) {
		background-color: oklch(var(--b2));
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}

	/* Task lists */
	:global(.collaborative-editor .milkdown li[data-checked='true']) {
		text-decoration: line-through;
		opacity: 0.6;
	}

	/* Strikethrough */
	:global(.collaborative-editor .milkdown del) {
		text-decoration: line-through;
	}
</style>
