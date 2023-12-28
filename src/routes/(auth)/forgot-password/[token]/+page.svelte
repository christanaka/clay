<script lang="ts">
	import { enhance } from '$app/forms';

	const { form } = $props();
</script>

<form method="post" use:enhance>
	<label for="newPassword">New Password</label>
	<input type="password" name="newPassword" id="newPassword" /><br />
	{#if form?.errors?.newPassword}
		<p>{form.errors.newPassword[0]}</p>
	{/if}

	<button>Reset password</button>
</form>
