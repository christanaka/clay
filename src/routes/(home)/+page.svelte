<script lang="ts">
	import { enhance } from '$app/forms';

	const { data } = $props();
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if data.user}
	<p>Hello {data.user.firstName} {data.user.lastName}!</p>

	{#if !data.user.isEmailVerified}
		<p>Please verify your email.</p>
		<a href="/verify-email">Verify</a>
	{/if}

	<form action="/logout" method="post" use:enhance>
		<button>Sign out</button>
	</form>
{:else}
	<a href="/login">Login</a>
	<a href="/signup">Sign up</a>
{/if}
