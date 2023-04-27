export interface SortedListEntry {
    weight: number;
    getTitle: () => string;
    getSubtitle?: () => string;
}

export interface SortedList {
    readonly entries: SortedListEntry[];
    getTitle: () => string;
    getShortenedTitle: (length: number) => string;
}

export function isSortedListEntry(obj: any): obj is SortedListEntry {
    return !!obj && typeof obj.weight === `number` && typeof obj.getTitle === `function`;
}

export function isSortedList(obj: any): obj is SortedList {
    return (
        !!obj &&
        Array.isArray(obj.entries) &&
        typeof obj.getTitle === `function` &&
        (obj.entries as Array<any>).every(entry => isSortedListEntry(entry))
    );
}
