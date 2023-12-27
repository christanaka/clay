<script lang="ts">
	const { data } = $props();
</script>

{#if !data.isTokenValid}
	<p>Token is invalid or has expired.</p>
{/if}
