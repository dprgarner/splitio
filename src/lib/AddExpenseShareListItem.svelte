<script lang="ts">
	import { Text, Graphic } from '@smui/list';
	import IconButton from '@smui/icon-button';
	import { getMemberAvatarURL } from '$lib/_modules/utils';

	import Textfield from '@smui/textfield';
	import type { Currency, Member } from '$lib/_modules/types';
	import { SplitType } from '$lib/_modules/types';
	import { CURRENCY_SYMBOLS } from './_modules/constants';

	export let value: number;
	export let setValue: (memberName: string, value: number) => void;
	export let member: Member;
	export let currency: Currency;
	export let onDelete: () => void;
	export let splitType: SplitType;

	function onChangeValue(e: any) {
		setValue(member.name, parseFloat(e.target.value));
	}

	$: sharePlural = value === 1 ? 'share' : 'shares';
</script>

<li class="item" class:uninvolved={value === 0}>
	<Graphic style="background-image: url({getMemberAvatarURL(member.name)});" />
	<Text>{member.name}</Text>

	<div class="meta">
		{#if splitType === SplitType.Share}
			<Textfield
				{value}
				on:change={onChangeValue}
				class="expense-share-textfield"
				type="number"
				suffix={sharePlural}
				input$step={1}
				input$min={0}
			/>
		{:else if splitType === SplitType.Percent}
			<Textfield
				{value}
				on:change={onChangeValue}
				class="expense-share-textfield"
				type="number"
				suffix={'%'}
				input$min={0}
				input$step={1}
			/>
		{:else if splitType === SplitType.Amount}
			<Textfield
				{value}
				on:change={onChangeValue}
				class="expense-share-textfield"
				type="number"
				prefix={CURRENCY_SYMBOLS[currency]}
				input$min={0}
				input$step={0.01}
			/>
		{/if}

		<IconButton class="material-icons" style="cursor: pointer" on:click={onDelete}
			>clear
		</IconButton>
	</div>
</li>

<style>
	.item {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: flex-start;
		margin: 0;
		padding: 0;
	}

	.uninvolved {
		opacity: 0.5;
	}

	.meta {
		flex-grow: 1;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: flex-end;
	}

	:global(.expense-share-textfield) {
		width: 125px;
	}
</style>
