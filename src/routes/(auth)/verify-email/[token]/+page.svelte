<script lang="ts">
	import { enhance } from '$app/forms';

	const { data } = $props();
</script>

{#if !data.isTokenValid}
	<p>Token is invalid or has expired.</p>
{/if}
