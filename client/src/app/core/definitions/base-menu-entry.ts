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
     * A string passed as css class to the related html tag.
     */
    cssClass?: string;
}
