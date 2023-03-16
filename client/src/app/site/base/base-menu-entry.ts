export interface BaseMenuEntry<P = any> {
    /**
     * The route for the router to navigate to on click.
     */
    route: string;

    /**
     * The display string to be shown.
     */
    displayName: string;

    /**
     * The font awesom icon to display.
     */
    icon: string;

    /**
     * For sorting the entries.
     */
    weight: number;

    /**
     * Whether an entry has a divider below.
     */
    hasDividerBelow?: boolean;

    /**
     * The permission to see the entry.
     */
    permission?: P;

    /**
     * Can be used to set a custom height for the menu entry.
     */
    customHeight?: string;
}

export function getCustomStyleForEntry(entry: BaseMenuEntry): { [key: string]: any } {
    if (entry.customHeight) {
        return { height: entry.customHeight, lineHeight: entry.customHeight };
    }
    return {};
}
