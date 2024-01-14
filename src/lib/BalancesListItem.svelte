<script lang="ts">
	import { Item, Text, PrimaryText, SecondaryText, Meta, Graphic } from '@smui/list';
	import { absRounded, getMemberAvatarURL } from './_modules/utils';
	import { CURRENCY_SYMBOLS } from './_modules/constants'
	import type { Currency } from './_modules/types'

	export let payerName: string;
	export let amount: number;
	export let isExpanded: boolean;
	export let onClickCallback: () => void;
	export let currency: Currency;
</script>

<Item on:click={onClickCallback}>
	<Graphic style="background-image: url({getMemberAvatarURL(payerName)});" />
	<Text>
		<PrimaryText>{payerName}</PrimaryText>
		{#if amount !== 0.0}
			<SecondaryText class={amount < 0 ? 'error-text' : 'success-text'}>
				{amount < 0 ? 'owes' : 'receives'} {CURRENCY_SYMBOLS[currency]}{absRounded(amount)}
			</SecondaryText>
		{:else}
			<SecondaryText>
				no debt
			</SecondaryText>
		{/if}
	</Text>
	<Meta class="material-icons">{isExpanded ? 'expand_less' : 'expand_more'}</Meta>
</Item>
