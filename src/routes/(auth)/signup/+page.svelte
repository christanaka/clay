<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	const { form } = $props<{ form: ActionData }>();
</script>

<form method="post" use:enhance>
	<label for="firstName">First Name</label>
	<input name="firstName" id="firstName" type="text" value={form?.data?.firstName ?? ''} /><br />
	{#if form?.errors.firstName}
		<p>{form.errors.firstName[0]}</p>
	{/if}

	<label for="lastName">Last Name</label>
	<input name="lastName" id="lastName" type="text" value={form?.data?.lastName ?? ''} /><br />
	{#if form?.errors.lastName}
		<p>{form.errors.lastName[0]}</p>
	{/if}

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

	<input
		name="agreeToTerms"
		id="agreeToTerms"
		type="checkbox"
		checked={!!form?.data?.agreeToTerms}
	/>
	<label for="agreeToTerms"
		>By creating an account, you agree to the <a href="terms">Terms of Service</a> and allow us to contact
		you by email.</label
	><br />
	{#if form?.errors.agreeToTerms}
		<p>{form.errors.agreeToTerms[0]}</p>
	{/if}

	<button>Sign up</button>
</form>
