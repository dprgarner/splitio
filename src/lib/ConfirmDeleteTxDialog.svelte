<script lang="ts">
	import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import List from '@smui/list';
	import TransactionListItem from './TransactionListItem.svelte';
	import { removeTransaction } from './_modules/money';
	import type { Transaction } from './_modules/types'
	import type { Currency } from './_modules/types'

	export let openDialog: boolean;
	export let transaction: Transaction;
	export let transactionKey: string;
	export let currency: Currency;
</script>

<Dialog
	bind:open={openDialog}
	aria-labelledby="default-focus-title"
	aria-describedby="default-focus-content"
>
	{#if transaction }
		<Title id="default-focus-title">⚠️ delete transaction?</Title>
		<Content id="default-focus-content">
			<List twoLine avatarList>
				<TransactionListItem {transaction} {currency} />
			</List>
			<p>this will delete the selected transaction from the group. continue?</p>
		</Content>
		<Actions>
			<Button use={[InitialFocus]}>
				<Label>cancel</Label>
			</Button>
			<Button
				variant="unelevated"
				on:click={() => {
					removeTransaction(transactionKey, transaction);
				}}
			>
				<Label>delete</Label>
			</Button>
		</Actions>
	{/if}
</Dialog>
