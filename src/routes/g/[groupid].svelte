<script lang="ts" context="module">
	import type { LoadInput } from '@sveltejs/kit'

	export async function load({ page }: LoadInput<{ groupid: string }>) {
		return {
			props: {
				groupId: page.params.groupid
			}
		};
	}
</script>

<script lang="ts">
	import SvelteSeo from 'svelte-seo';
	import { onMount } from 'svelte';
	import Fab, { Icon as FabIcon } from '@smui/fab';
	import List, { Item, Text, Meta, Graphic } from '@smui/list';
	import Snackbar, { Label, SnackbarComponentDev } from '@smui/snackbar';
	import { initAppDB } from '$lib/_modules/initGun';
	import AddExpenseDialog from '$lib/AddExpenseDialog.svelte';
	import AddMemberDialog from '$lib/AddMemberDialog.svelte';
	import { getMemberAvatarURL } from '$lib/_modules/utils';
	import ViewBalancesDialog from '$lib/ViewBalancesDialog.svelte';
	import Chip, { Set, LeadingIcon, Text as ChipText } from '@smui/chips';
	import { deleteSecure, onSecure, putSecure, setSecure } from '$lib/_modules/secure';
	import { secretKey, groupDB, groupStore, resetGroupStore } from '$lib/_modules/stores';
	import LoadingSpinnerOverlay from '$lib/LoadingSpinnerOverlay.svelte';
	import { storeRecentGroup } from '$lib/_modules/recentGroupsStorage';
	import SyncIssuesDialog from '$lib/SyncIssuesDialog.svelte';
	import TransactionsList from '$lib/TransactionsList.svelte';
	import { PLACEHOLDER_GROUP_NAME } from '$lib/_modules/constants';
	import { GroupNodeState } from '$lib/_modules/types';
	import type { Expense, Payment, Member, GroupInfo } from '$lib/_modules/types';
	import GroupNotFoundDialog from '$lib/GroupNotFoundDialog.svelte';
	import GroupNotesDialog from '$lib/GroupNotesDialog.svelte';

	export let groupId: string;

	let openAddMemberDialog: boolean = false;
	let openAddExpenseDialog: boolean = false;
	let openViewBalancesDialog: boolean = false;
	let openSyncIssuesDialog: boolean = false;
	let openGroupNotesDialog: boolean = false;
	let copiedLinkSnackbar: SnackbarComponentDev;

	let groupNodeState = GroupNodeState.Unknown;

	let chips = [
		{
			title: 'balances',
			icon: 'balance',
			onClick: () => (openViewBalancesDialog = true)
		},
		{
			title: 'group notes',
			icon: 'description',
			onClick: () => (openGroupNotesDialog = true)
		},
		{
			title: 'share group',
			icon: 'share',
			onClick: () => {
				if (navigator.share) {
					navigator
						.share({
							title: 'splitio',
							text: "Let's split bills with this group in splitio 💰",
							url: window.location.href
						})
						.then(() => console.log('Successful share'))
						.catch((error) => console.log('Error sharing', error));
				} else {
					navigator.clipboard.writeText(window.location.href).then(copiedLinkSnackbar.open);
				}
			}
		},
		{
			title: 'sync issues?',
			icon: 'sync_problem',
			onClick: () => (openSyncIssuesDialog = true)
		}
	];

	onMount(() => {
		resetGroupStore();
		const appDB = initAppDB();
		$secretKey = window.location.hash;
		const GROUPID = groupId || 'unknown group';
		$groupDB = appDB.get(GROUPID);

		// detect group not found
		$groupDB.once(
			(val) => {
				if (val === undefined) groupNodeState = GroupNodeState.NotFound;
				else groupNodeState = GroupNodeState.Found;
			},
			{ wait: 5000 }
		);

		onSecure(
			$groupDB.get('expenses').map(),
			$secretKey,
			(plain: Expense, key: string) => ($groupStore.expenses[key] = plain),
			(key: string) => {
				delete $groupStore.expenses[key];
				$groupStore.expenses = $groupStore.expenses;
			}
		);

		onSecure(
			$groupDB.get('members').map(),
			$secretKey,
			(plain: Member, key: string) => ($groupStore.members[plain.name] = plain),
			(key: string) => {
				delete $groupStore.members[key];
				$groupStore.members = $groupStore.members;
			}
		);

		onSecure(
			$groupDB.get('groupInfo'),
			$secretKey,
			(plain: GroupInfo, key: keyof GroupInfo) => {
				$groupStore.groupInfo.name = plain.name;
				$groupStore.groupInfo.currency = plain.currency;
				storeRecentGroup(GROUPID, $secretKey, plain.name);
			},
			(key: keyof GroupInfo) => {
				delete $groupStore.groupInfo[key];
				$groupStore.groupInfo = $groupStore.groupInfo;
			}
		);

		onSecure(
			$groupDB.get('payments').map(),
			$secretKey,
			(plain: Payment, key: string) => ($groupStore.payments[key] = plain),
			(key: string) => {
				delete $groupStore.payments[key];
				$groupStore.payments = $groupStore.payments;
			}
		);

		onSecure(
			$groupDB.get('groupNotes'),
			$secretKey,
			(plain: string, key: string) => {
				$groupStore.groupNotes = plain;
			},
			(key: string) => {
				$groupStore.groupNotes = '';
			}
		);
	});

	const addExpense = async (
		expense: Expense
	) => {
		const memberExists = expense.paidBy in $groupStore.members;
		if (!memberExists) throw SyntaxError;
		setSecure(
			$groupDB!.get('expenses'),
			expense,
			$secretKey
		);
	};

	const addMember = (memberName: string) => {
		setSecure($groupDB!.get('members'), { name: memberName }, $secretKey);
	};

	const putGroupNotes = (noteValue: string, onCompletion: Function) => {
		let node = $groupDB!.get('groupNotes');
		if (!noteValue) deleteSecure(node, onCompletion);
		else putSecure(node, noteValue, $secretKey, onCompletion);
	};

	$: transactions = Object.entries({ ...$groupStore.expenses, ...$groupStore.payments }).sort(
		(a, b) => b[1].timestamp - a[1].timestamp
	);
	$: members = Object.entries($groupStore.members);

	$: currency = $groupStore.groupInfo.currency || 'USD'
</script>

<SvelteSeo
	openGraph={{
		title: 'splitio | group',
		description:
			'split your bills easily! splitio is an open-source webapp built for tracking debts and payments quickly, without any user accounts.',
		url: 'https://github.com/cryptoboid/splitio',
		type: 'website',
		images: [
			{
				url: 'https://raw.githubusercontent.com/cryptoboid/splitio/main/static/splitio_banner.png',
				width: 1280,
				height: 640,
				alt: 'splitio promotion banner'
			}
		]
	}}
/>

<svelte:head>
	<title>splitio | {$groupStore.groupInfo.name}</title>
</svelte:head>

<div class="mdc-typography--headline5">{$groupStore.groupInfo.name}</div>

<Set
	{chips}
	style="overflow-x: auto; flex-wrap: nowrap; margin-left: -10px; margin-right: -10px"
	let:chip
>
	<Chip {chip} shouldRemoveOnTrailingIconClick={false} on:click={chip.onClick}>
		<LeadingIcon class="material-icons">{chip.icon}</LeadingIcon>
		<ChipText tabindex={0}>{chip.title}</ChipText>
	</Chip>
</Set>

<div class="mdc-typography--headline5">💸 group transactions</div>

<TransactionsList {transactions} {currency} />

<div class="mdc-typography--headline5">🤝 members</div>

<List oneLine avatarList style="margin-bottom: 70px;">
	{#each members as [key, member]}
		<Item class="rounded-item">
			<Graphic style="background-image: url({getMemberAvatarURL(member.name)});" />
			<Text>{member.name}</Text>
			<!-- <Meta class="material-icons">info</Meta> -->
		</Item>
	{/each}
	<Item on:click={() => (openAddMemberDialog = true)} class="rounded-item">
		<Text>add someone</Text>
		<Meta class="material-icons">person_add</Meta>
	</Item>
</List>

<!-- floating action button -->
<div class="flexy">
	<div class="margins">
		<Fab style="border-radius: 17px;" on:click={() => (openAddExpenseDialog = true)}>
			<FabIcon class="material-icons">post_add</FabIcon>
		</Fab>
	</div>
</div>

<!-- loading overlay -->
<LoadingSpinnerOverlay showOverlay={$groupStore.groupInfo.name === PLACEHOLDER_GROUP_NAME} />

<GroupNotFoundDialog {groupNodeState} />

<!-- add member dialog -->
<AddMemberDialog bind:openDialog={openAddMemberDialog} addCallback={addMember} />

<!-- add expense dialog -->
<AddExpenseDialog
	membersList={members}
	{currency}
	bind:openDialog={openAddExpenseDialog}
	addCallback={addExpense}
/>

<ViewBalancesDialog
	bind:openDialog={openViewBalancesDialog}
	expensesObj={$groupStore.expenses}
	paymentsObj={$groupStore.payments}
	membersList={members}
	{currency}
/>

<SyncIssuesDialog bind:openDialog={openSyncIssuesDialog} />

<GroupNotesDialog bind:openDialog={openGroupNotesDialog} putNotesCallback={putGroupNotes} />

<Snackbar bind:this={copiedLinkSnackbar}>
	<Label>📋 link copied to clipboard, now share it!</Label>
</Snackbar>

<style>
	.flexy {
		/* display: flex;
		flex-wrap: wrap;
		align-items: center; */
		position: fixed;
		bottom: 10px;
		right: 10px;
		z-index: 1;
	}

	* :global(.margins) {
		margin: 0 0.4em 0.4em 0;
	}
</style>
