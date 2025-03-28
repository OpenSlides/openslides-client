/**
 * One can navigate to the detail page of every object implementing this interface.
 */
export interface DetailNavigable {
    /**
     * Get the url for the detail view, so the user can navigate to it.
     */
    getDetailStateUrl(): string;
}

/**
 * check if a given object implements implements this interface
 *
 * @param obj
 * @returns true if the interface is implemented
 */
export function isDetailNavigable(obj: object | undefined): obj is DetailNavigable {
    if (!obj) {
        return false;
    }
    return typeof (obj as DetailNavigable).getDetailStateUrl === `function`;
}
