<script lang="ts">
	import { enhance } from '$app/forms';

	const { form } = $props();
</script>

<form method="post" use:enhance>
	<label for="email">Email</label>
	<input name="email" id="email" type="email" value={form?.data?.email ?? ''} /><br />
	{#if form?.errors.email}
		<p>{form.errors.email[0]}</p>
	{/if}

	<label for="password">Password</label>
	<input name="password" id="password" type="password" value={form?.data?.password ?? ''} /><br />
	{#if form?.errors.password}
		<p>{form.errors.password[0]}</p>
	{/if}

	<button>Log in</button>
	<a href="/forgot-password">Forgot password?</a>
	<a href="/signup">Sign up</a>
</form>
