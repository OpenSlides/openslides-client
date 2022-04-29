export function HasOnAfterAppsLoaded(instance: any): instance is OnAfterAppsLoaded {
    return typeof instance?.onAfterAppsLoaded === `function`;
}

/**
 * A lifecyclehook to be called, after all apps are loaded.
 */
export interface OnAfterAppsLoaded {
    /**
     * The hook to call
     */
    onAfterAppsLoaded(): void;
}
