<script lang="ts">
	import AddExpenseShareListItem from './AddExpenseShareListItem.svelte';
	import Menu from '@smui/menu';
	import List, { Item, Text, Meta, Graphic } from '@smui/list';
	import { Icon } from '@smui/icon-button';
	import { getMemberAvatarURL } from '$lib/_modules/utils';

	import Button, { Label } from '@smui/button';
	import { Cell } from '@smui/layout-grid';
	import type { Currency, Member, SplitType } from '$lib/_modules/types';

	export let membersList: Array<[string, Member]>;
	export let currency: Currency;
	export let splitType: SplitType;
	export let addMember: (memberKey: string) => void
	export let deleteMember: (memberKey: string) => void
	export let setValue: (memberKey: string, value: number) => void
	export let split: Record<SplitType, Record<string, number>>

	// @ts-expect-error
	let menu: Menu;

	$: areAllInvolved = !!membersList.length && membersList.reduce(
		(acc, [member]) => acc && member in split[splitType],
		true
	);

	$: if (menu && areAllInvolved) menu.setOpen(false);
</script>

<Cell span={12}>
	<List oneLine avatarList>
		{#each membersList as [key, member]}
			{#if key in split[splitType]}
				<AddExpenseShareListItem
					{member}
					{currency}
					{splitType}
					value={split[splitType][key]}
					{setValue}
					onDelete={() => deleteMember(key)}
				/>
			{/if}
		{/each}
	</List>
</Cell>

<Cell span={12} style="display: flex; flex-flow: row nowrap; justify-content: flex-end;">
	<div>
		<Menu bind:this={menu}>
			<List oneLine avatarList>
				{#each membersList as [memberKey, member]}
					{#if !(memberKey in split[splitType])}
						<Item class="rounded-item" on:SMUI:action={() => addMember(memberKey)}>
							<Graphic style="background-image: url({getMemberAvatarURL(member.name)});" />
							<Text>{member.name}</Text>
						</Item>
					{/if}
				{/each}
			</List>
		</Menu>

		{#if !areAllInvolved}
			<Button on:click={() => menu.setOpen(true)} variant="outlined" class="button-shaped-round">
				<Icon class="material-icons">person_add</Icon>
				<Label>add someone</Label>
			</Button>
		{/if}
	</div>
</Cell>
