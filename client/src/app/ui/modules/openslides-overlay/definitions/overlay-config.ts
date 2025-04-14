import { InjectionToken } from '@angular/core';

export const OVERLAY_COMPONENT_DATA = new InjectionToken<any>(`overlay-component-data`);

export type OverlayPosition = `center` | `left` | `top` | `right` | `bottom`;

export interface CustomOverlayConfig<T = any> {
    /**
     * A css-class attached to the backdrop-component in the DOM
     */
    backdropClass?: string;
    /**
     * Optional data passed to the component attached to an overlay-instance
     *
     * Accessible via the `OVERLAY_COMPONENT_DATA` injectiontoken
     */
    data?: T;
    /**
     * The position on the screen of the component attached to an overlay-instance
     */
    position?: OverlayPosition;
    /**
     * A function that is executed immediately after an overlay-instance is disposed
     */
    onCloseFn?: () => void;
}
