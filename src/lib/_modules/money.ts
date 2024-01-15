import { get } from 'svelte/store';
import { setSecure } from './secure';
import type { Expense, Payment, Transaction, Member } from './types';
import { SplitType } from './types';
import { groupDB, groupStore, secretKey } from './stores';

export function computeBalances(
	allExpensesObject: Record<string, Expense>,
	allMembers: Array<[string, Member]>,
	allDonePaymentsObject: Record<string, Payment>
): Array<[string, number]> {
	const allExpenses = Object.entries(allExpensesObject);
	const allDonePayments = Object.entries(allDonePaymentsObject);
	if (!allExpenses.length || !allMembers.length) return [];

	const numMembers = allMembers.length;
	const totalByMember: Record<string, number> = {};
	const eachMemberBalance: Record<string, number> = {};
	const payments: Record<string, Array<[string, number]>> = {}; // payments["charles"] = [["cryptoboid", 10]]

	for (const [member] of allMembers) {
		eachMemberBalance[member] = 0;
		payments[member] = [];
		totalByMember[member] = 0;
	}
	for (const [_, expense] of allExpenses) {
		const payer = expense.paidBy;
		if (eachMemberBalance[payer] === undefined) {
			return [];
		}
		eachMemberBalance[payer] += expense.amount;

		if (!expense.splitType || !expense.splits) {
			// Legacy expense: split equally by all members.
			for (const [member] of allMembers) {
				totalByMember[member] += expense.amount / numMembers;
			}
		} else {
			const totalShares = Object.values(expense.splits).reduce((acc, v) => acc + v, 0);
			for (const [member, share] of Object.entries(expense.splits)) {
				totalByMember[member] += expense.amount * share / totalShares;
			}
		}
	}

	for (const payment of allDonePayments) {
		const payer = payment[1].paidBy;
		const receiver = payment[1].receivedBy;
		eachMemberBalance[payer] += payment[1].amount;
		eachMemberBalance[receiver] -= payment[1].amount;
	}

	for (const [member, balance] of Object.entries(eachMemberBalance)) {
		eachMemberBalance[member] = balance - totalByMember[member];
	}

	return Object.entries(eachMemberBalance).sort((a, b) => b[1] - a[1]);
}

export function computePayments(
	balance: [string, number][]
): Record<string, Array<[string, number]>> {
	let sortedMostGenerous = balance.map((x) => Array.from(x) as [string, number]);
	let currMostGen = 0,
		currLeastGen = sortedMostGenerous.length - 1;

	let result: Record<string, Array<[string, number]>> = {};

	for (const member of sortedMostGenerous) {
		result[member[0]] = [];
	}

	while (currMostGen < currLeastGen) {
		let mostGen = sortedMostGenerous[currMostGen];
		let leastGen = sortedMostGenerous[currLeastGen];

		// reached a 0-only border, force finish
		if (mostGen[1] === 0 || leastGen[1] === 0) {
			currLeastGen--;
			currMostGen++;
		} else if (mostGen[1] + leastGen[1] > 0) {
			mostGen[1] += leastGen[1];
			result[leastGen[0]].push([mostGen[0], -leastGen[1]]);
			currLeastGen--;
		} else if (mostGen[1] + leastGen[1] < 0) {
			leastGen[1] += mostGen[1];
			result[leastGen[0]].push([mostGen[0], mostGen[1]]);
			currMostGen++;
		} else if (mostGen[1] + leastGen[1] === 0) {
			let aux = leastGen[1];
			leastGen[1] += aux;
			mostGen[1] += aux;
			currLeastGen--;
			currMostGen++;
			result[leastGen[0]].push([mostGen[0], aux]);
		}
	}

	return result;
}

export function recordPayment(payerName: string, receiverName: string, payedAmount: number) {
	let groupStoreRef = get(groupStore);
	const bothExist = payerName in groupStoreRef.members && receiverName in groupStoreRef.members;
	if (!bothExist) throw SyntaxError;
	setSecure(
		get(groupDB)!.get('payments'),
		{
			paidBy: payerName,
			receivedBy: receiverName,
			amount: payedAmount,
			timestamp: Date.now()
		},
		get(secretKey)
	);
}

function removeExpense(key: string) {
	get(groupDB)!.get('expenses').get(key).put(null);
}

function removePayment(key: string) {
	get(groupDB)!.get('payments').get(key).put(null);
}

export function removeTransaction(key: string, transaction: Transaction) {
	if ('title' in transaction) removeExpense(key);
	else removePayment(key);
}
