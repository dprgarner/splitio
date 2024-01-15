<script lang="ts">
	import { SplitType } from './_modules/types';
	import { Item, Graphic, Text, PrimaryText, SecondaryText, Meta } from '@smui/list';
	import { absRounded, timestampToShortDate } from './_modules/utils';
	import { CURRENCY_SYMBOLS } from './_modules/constants';
	import type { Transaction, Currency } from './_modules/types';

	export let transaction: Transaction;
	export let onDeleteCallback: (() => void) | undefined = undefined;
	export let currency: Currency;

	$: isSettlement = !('title' in transaction && transaction.title);
	let open = false;
</script>

<div>
	<Item
		class={`rounded-item ${isSettlement ? 'settlement-item' : ''}`}
		on:SMUI:action={() => (open = !open)}
		nonInteractive={false}
	>
		<Graphic style="text-align: center; width: 1.75rem;">
			{timestampToShortDate(transaction.timestamp)}
		</Graphic>
		{#if 'title' in transaction}
			<Text>
				<PrimaryText>{transaction.title}</PrimaryText>
				<SecondaryText
					>{CURRENCY_SYMBOLS[currency]}{transaction.amount}, paid by {transaction.paidBy}</SecondaryText
				>
			</Text>
		{:else}
			<Text>
				<PrimaryText>{`💵 paid to ${transaction.receivedBy}`}</PrimaryText>
				<SecondaryText
					>{CURRENCY_SYMBOLS[currency]}{absRounded(transaction.amount)} from {transaction.paidBy}</SecondaryText
				>
			</Text>
		{/if}
		{#if onDeleteCallback}
			<Meta class="material-icons" on:click={onDeleteCallback}>clear</Meta>
		{/if}
	</Item>

	{#if open && 'splits' in transaction && transaction.splits}
		<ul>
			{#each Object.entries(transaction.splits) as [memberName, split]}
				<li>
					<Text>
						{#if transaction.splitType === SplitType.Share}
							{memberName}'s relative share was {split}
						{:else if transaction.splitType === SplitType.Percent}
							{memberName}'s share was {split.toFixed(0)}%
						{:else if transaction.splitType === SplitType.Amount}
							{memberName}'s share was {CURRENCY_SYMBOLS[currency]}{split.toFixed(2)}
						{/if}
					</Text>
				</li>
			{/each}
		</ul>
	{/if}
</div>
