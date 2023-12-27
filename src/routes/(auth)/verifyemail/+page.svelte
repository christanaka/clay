<script>
	import { enhance } from '$app/forms';

	const { form } = $props();
</script>

<form method="post" use:enhance>
	<label for="code">Code</label>
	<input type="text" name="code" id="code" /><br />
	{#if form?.errors.code}
		<p>{form.errors.code[0]}</p>
	{/if}

	<button>Verify email</button>
</form>
