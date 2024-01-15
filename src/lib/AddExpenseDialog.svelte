<script lang="ts">
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import FormField from '@smui/form-field';
	import Radio from '@smui/radio';
	import LayoutGrid, { Cell, InnerGrid } from '@smui/layout-grid';
	import Select, { Option } from '@smui/select';
	import Icon from '@smui/select/icon';
	import { Graphic } from '@smui/list';
	import { Currency, Expense, Member, SplitType } from './_modules/types';
	import { getMemberAvatarURL } from './_modules/utils';
	import { CURRENCY_SYMBOLS } from './_modules/constants';
	import AddExpenseSplitField from './AddExpenseSplitField.svelte';

	export let openDialog: boolean;
	export let addCallback: (expense: Expense) => void;
	export let membersList: Array<[string, Member]>;
	export let currency: Currency;

	function getInitialSplit(): Record<SplitType, Record<string, number>> {
		return {
			[SplitType.Share]: membersList.reduce((acc, [member]) => ({ ...acc, [member]: 1 }), {}),
			[SplitType.Amount]: membersList.reduce((acc, [member]) => ({ ...acc, [member]: 0 }), {}),
			[SplitType.Percent]: membersList.reduce((acc, [member]) => ({ ...acc, [member]: 0 }), {})
		};
	}

	const splitOptions: Array<{ name: string; value: SplitType }> = [
		{ name: 'by shares', value: SplitType.Share },
		{ name: 'by percentages', value: SplitType.Percent },
		{ name: 'by exact amounts', value: SplitType.Amount }
	];

	let inputName: string = '';
	let inputAmount: number = 0.0;
	let inputPaidBy: string = '';
	let isSplitPopulated = false;
	let split = getInitialSplit();
	let splitType: SplitType | undefined = undefined;

	function addMember(memberKey: string) {
		split[SplitType.Share][memberKey] = 0;
		split[SplitType.Amount][memberKey] = 0;
		split[SplitType.Percent][memberKey] = 0;
		split = split;
	}

	function deleteMember(memberKey: string) {
		delete split[SplitType.Share][memberKey];
		delete split[SplitType.Amount][memberKey];
		delete split[SplitType.Percent][memberKey];
		split = split;
	}

	function setValue(memberKey: string, value: number) {
		split[splitType!][memberKey] = value;
		split = split;
	}

	function onSubmit() {
		if (!splitType) return;

		const cleanedSplits :Record<string, number> = {};
		for (const [member, value] of Object.entries(split[splitType])) {
			if (!value) continue;
			cleanedSplits[member] = Math.round(value * 100) / 100
		}

		const expense = {
			timestamp: Date.now(),
			title: inputName,
			amount: inputAmount,
			paidBy: inputPaidBy,
			splits: cleanedSplits,
			splitType,
		};
		console.log(JSON.stringify(expense, null, 2))

		addCallback(expense);

		inputName = '';
		inputAmount = 0.0;
		inputPaidBy = '';
		isSplitPopulated = false;
		split = getInitialSplit();
		splitType = undefined;
	}

	$: isValid = (() => {
		if (inputName === '') return false;
		if (isNaN(inputAmount) || inputAmount <= 0.0) return false;
		if (inputPaidBy === '') return false;
		if (!splitType) return false;

		let valueTotal = 0;
		for (const value of Object.values(split[splitType])) {
			if (value < 0 || isNaN(value)) return false;
			valueTotal += value;
		}
		if (splitType === SplitType.Percent && Math.abs(100 - valueTotal) > 0.5) return false;
		if (splitType === SplitType.Amount && Math.abs(inputAmount - valueTotal) > 0.005) return false;

		return true;
	})();
</script>

<Dialog
	bind:open={openDialog}
	aria-labelledby="default-focus-title"
	aria-describedby="default-focus-content"
>
	<Title id="default-focus-title">🧾 add expense</Title>
	<Content id="default-focus-content">
		<LayoutGrid>
			<Cell span={12}>
				enter a description:
				<Textfield bind:value={inputName} />
			</Cell>
			<Cell span={12}>
				enter the {CURRENCY_SYMBOLS[currency]} amount:
				<Textfield type="number" bind:value={inputAmount} input$min={0} />
			</Cell>
			<Cell span={12}>
				who paid?
				<Select bind:value={inputPaidBy} class="add-expense-select">
					<Icon
						slot="leadingIcon"
						style="background-image: url({getMemberAvatarURL(inputPaidBy, 24)});"
					/>
					<Option value="" />
					{#each membersList as [key, member]}
						<Option value={member.name}>
							<Graphic
								style="background-image: url({getMemberAvatarURL(member.name, 24)});"
							/>{member.name}</Option
						>
					{/each}
				</Select>
			</Cell>

			<Cell span={12}>
				how should the expense be split?
				<InnerGrid>
					{#each splitOptions as option}
						<Cell span={4}>
							<FormField>
								<Radio
									bind:group={splitType}
									value={option.value}
									on:change={() => {
										if (!isSplitPopulated) {
											isSplitPopulated = true;
											split = getInitialSplit();
										}
									}}
								/>
								<span slot="label" style="white-space: nowrap; cursor: pointer;">
									{option.name}
								</span>
							</FormField>
						</Cell>
					{/each}
				</InnerGrid>
			</Cell>

			{#if splitType}
				<AddExpenseSplitField
					{membersList}
					{currency}
					{splitType}
					{split}
					{addMember}
					{deleteMember}
					{setValue}
				/>
			{/if}
		</LayoutGrid>
	</Content>
	<Actions>
		<Button>
			<Label>cancel</Label>
		</Button>
		<Button
			variant="unelevated"
			disabled={!isValid}
			on:click={onSubmit}
		>
			<Label>add</Label>
		</Button>
	</Actions>
</Dialog>
