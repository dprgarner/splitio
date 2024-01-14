<script lang="ts">
	import List, { Item, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list';
	import { absRounded, getMemberAvatarURL } from './_modules/utils';
	import { CURRENCY_SYMBOLS } from './_modules/constants'
	import type { Currency } from './_modules/types'

	export let pendingPayments: Array<[string, number]>;
	export let payerName: string;
	export let showRecordPaymentCallback: (rcvrName: string, debtAmnt: number, pyrName: string) => void;
	export let currency: Currency;
</script>

<List twoLine style="margin-left: 30px; margin-bottom: 10px;">
	{#if pendingPayments.length === 0}
		<Item disabled>
			<Text>
				<PrimaryText>no pending debts!</PrimaryText>
				<SecondaryText>check others for payments...</SecondaryText>
			</Text>
		</Item>
	{:else}
		{#each pendingPayments as [receiverName, debtAmount]}
			<Item on:click={() => showRecordPaymentCallback(receiverName, debtAmount, payerName)}>
				<Text>
					<PrimaryText><span style="color: gray">pay to</span> {receiverName}</PrimaryText>
					<SecondaryText class="error-text">{CURRENCY_SYMBOLS[currency]}{absRounded(debtAmount)}</SecondaryText>
				</Text>
				<Graphic
					style="margin-left: auto; margin-right: 0; background-image: url({getMemberAvatarURL(
						receiverName
					)});"
				/>
			</Item>
		{/each}
	{/if}
</List>
