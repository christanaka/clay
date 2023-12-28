<script lang="ts">
	import { enhance } from '$app/forms';

	const { form } = $props();
</script>

{#if form?.success}
	<p>An email with a password reset link has been sent to your inbox.</p>
{:else}
	<form method="post" use:enhance>
		<label for="email">Email</label>
		<input type="text" name="email" id="email" value={form?.data?.email ?? ''} /><br />
		{#if form?.errors?.email}
			<p>{form.errors.email[0]}</p>
		{/if}

		<button>Send reset link</button>
	</form>
{/if}
