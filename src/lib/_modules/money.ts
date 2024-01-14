import { get } from "svelte/store";
import { setSecure } from "./secure";
import type { Expense, Payment, Transaction, Member } from '$lib/_modules/types';
import { groupDB, groupStore, secretKey } from "./stores";

export function computeBalances(
	allExpensesObject: Record<string, Expense>,
	allMembers: Array<[string, Member]>,
	allDonePaymentsObject: Record<string, Payment>
): Array<[string, number]> {
    let allExpenses = Object.entries(allExpensesObject);
    let allDonePayments = Object.entries(allDonePaymentsObject);
    if (!allExpenses || allMembers.length === 0)
        return [];

    let total = allExpenses.map((x) => x[1].amount).reduce((a, b) => a + b, 0);
    let numMembers = allMembers.length;
    let eachUserBalance: Record<string, number> = {};
    let payments: Record<string, Array<[string, number]>> = {}; // payments["charles"] = [["cryptoboid", 10]]

    for (const member of allMembers) { // if (member[1] === NaN) return {};
        eachUserBalance[member[0]] = 0;
        payments[member[0]] = [];
    }
    // console.debug("after members! ===============", eachUserBalance);

    for (const expense of allExpenses) {
        const payer = expense[1].paidBy;
        if (eachUserBalance[payer] === undefined)
            return [];

        eachUserBalance[payer] += expense[1].amount;
    }

    for (const payment of allDonePayments) {
        const payer = payment[1].paidBy;
        const receiver = payment[1].receivedBy;
        // if (eachUserBalance[payer] === undefined)
        //     return [];
        eachUserBalance[payer] += payment[1].amount;
        eachUserBalance[receiver] -= payment[1].amount;
    }

    for (let [usr, balance] of Object.entries(eachUserBalance)) {
        eachUserBalance[usr] = balance - total / numMembers;
    }

    // console.debug(eachUserBalance);
    return Object.entries(eachUserBalance).sort((a, b) => b[1] - a[1]);
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
            result[leastGen[0]].push([
                mostGen[0], - leastGen[1]
            ]);
            currLeastGen--;
        } else if (mostGen[1] + leastGen[1] < 0) {
            leastGen[1] += mostGen[1];
            result[leastGen[0]].push([
                mostGen[0], mostGen[1]
            ]);
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
};

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
    // @ts-expect-error
    get(groupDB)!.get('expenses').get(key).put(null);
};

function removePayment(key: string) {
    // @ts-expect-error
    get(groupDB)!.get('payments').get(key).put(null);
};

export function removeTransaction(key: string, transaction: Transaction) {
    if ('title' in transaction) removeExpense(key);
    else removePayment(key);
}
