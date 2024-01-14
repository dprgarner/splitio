<script lang="ts">
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import { PLACEHOLDER_GROUP_NAME } from './_modules/constants';
	import Select, { Option } from '@smui/select';
	import { CURRENCY_SYMBOLS } from './_modules/constants'

	export let openDialog: boolean;
	export let addCallback: (name: string, currency: string) => void;

	let inputName: string;

	let options: string[] = Object.keys(CURRENCY_SYMBOLS)
	let currency: string = 'USD'
</script>

<style>
	:global(.menu-hack) {
		max-width: 300px;
	}
</style>


<Dialog
	bind:open={openDialog}
	aria-labelledby="default-focus-title"
	aria-describedby="default-focus-content"
>
	<Title id="default-focus-title">✨ create a new group</Title>
	<Content id="default-focus-content">
		<div>
			please enter your group's name:
			<Textfield bind:value={inputName} />
		</div>

		<div style="position: relative;">
			<Select bind:value={currency} label="Currency" menu$fixed={true} menu$class={"menu-hack"}>
				{#each options as option}
					<Option value={option}>{option} {CURRENCY_SYMBOLS[option]}</Option>
				{/each}
			</Select>
		</div>
	</Content>
	<Actions>
		<Button>
			<Label>cancel</Label>
		</Button>
		<Button
			variant="unelevated"
			disabled={inputName === '' || inputName === PLACEHOLDER_GROUP_NAME}
			on:click={() => {
				addCallback(inputName, currency);
				inputName = '';
			}}
		>
			<Label>create!</Label>
		</Button>
	</Actions>
</Dialog>
