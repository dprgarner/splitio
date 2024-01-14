<script lang="ts">
	import { Item, Graphic, Text, PrimaryText, SecondaryText, Meta } from '@smui/list';
	import { absRounded, timestampToShortDate } from './_modules/utils';
	import { CURRENCY_SYMBOLS } from './_modules/constants'
	import type { Transaction, Currency } from './_modules/types'

	export let transaction: Transaction;
	export let onDeleteCallback: (() => void) | undefined = undefined;
	export let currency: Currency;

	$: isSettlement = !('title' in transaction && transaction.title);
</script>

<div>
	<Item class={`rounded-item ${isSettlement ? 'settlement-item' : ''}`}>
		<Graphic style="text-align: center; width: 1.75rem;">
			{timestampToShortDate(transaction.timestamp)}
		</Graphic>
		{#if 'title' in transaction}
			<Text>
				<PrimaryText>{transaction.title}</PrimaryText>
				<SecondaryText>{CURRENCY_SYMBOLS[currency]}{transaction.amount} by {transaction.paidBy}</SecondaryText>
			</Text>
		{:else}
			<Text>
				<PrimaryText>{`💵 paid to ${transaction.receivedBy}`}</PrimaryText>
				<SecondaryText>{CURRENCY_SYMBOLS[currency]}{absRounded(transaction.amount)} from {transaction.paidBy}</SecondaryText>
			</Text>
		{/if}
		{#if onDeleteCallback}
			<Meta class="material-icons" on:click={onDeleteCallback}>clear</Meta>
		{/if}
	</Item>
</div>
