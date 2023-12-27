<script lang="ts">
	import { enhance } from '$app/forms';

	const { data } = $props();
	const { user } = data;
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if user}
	<p>Hello {user.firstName} {user.lastName}!</p>

	{#if !user.isEmailVerified}
		<p>Please verify your email.</p>
		<a href="/verifyemail">Verify</a>
	{/if}

	<form action="/logout" method="post" use:enhance>
		<button>Sign out</button>
	</form>
{/if}
