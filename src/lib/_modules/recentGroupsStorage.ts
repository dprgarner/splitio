import { MAX_RECENT_GROUPS_AMNT, RECENT_GROUPS_KEY } from "./constants";
import type { RecentGroup } from "./types";

export function storeRecentGroup(groupId: string, secretKey: string, groupName: string) {
    let recentGroups: RecentGroup[] = getRecentGroups();
    let otherGroups = recentGroups.filter(
        (value) => (value.groupId !== groupId)
    );
    otherGroups.unshift({ groupId, secretKey, groupName });
    otherGroups.splice(MAX_RECENT_GROUPS_AMNT);
    storeAllRecentGroups(otherGroups);
}

export function getRecentGroups(): RecentGroup[] {
    return JSON.parse(localStorage.getItem(RECENT_GROUPS_KEY) || '[]')
}

function storeAllRecentGroups(recentGroups: RecentGroup[]) {
    localStorage.setItem(RECENT_GROUPS_KEY, JSON.stringify(recentGroups));
}

// function isSameGroup(oldGroup: object, newGroupId: string, newSecretKey: string, newGroupName: string) {
//     return oldGroup.groupId === newGroupId
//         && oldGroup.secretKey === newSecretKey
//         && oldGroup.groupName === newGroupName;
// }

