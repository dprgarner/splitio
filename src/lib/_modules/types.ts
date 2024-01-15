import type { CURRENCY_SYMBOLS } from './constants'

export type Currency = keyof typeof CURRENCY_SYMBOLS

export enum GroupNodeState {
	Found = "FOUND",
	Unknown = "UNKNOWN",
	NotFound = "NotFound",
	Error = "ERROR"
}

export enum SplitType {
	Share = "SHARE",
	Percent = "PERCENT",
	Amount = "AMOUNT",
}

export type Expense = {
	amount: number;
	paidBy: string;
	timestamp: number;
	title: string;
	splitType?: SplitType,
	splits?: Record<string, number>
};

export type Payment = {
	amount: number;
	paidBy: string;
	receivedBy: string;
	timestamp: number;
};

export type Transaction = Expense | Payment

export type Member = {
	name: string;
};

export type GroupInfo = {
	name: string;
	currency?: Currency;
}

export type GroupStore = {
	expenses: Record<string, Expense>;
	payments: Record<string, Payment>;
	members: Record<string, Member>;
	groupInfo: GroupInfo;
	groupNotes: string;
};

export type RecentGroup = {
	groupId: string;
	groupName: string;
	secretKey: string;
}
