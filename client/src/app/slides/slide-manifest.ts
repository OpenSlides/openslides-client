import { InjectionToken } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

export interface SlideConfiguration {
    /**
     * Should this slide be scrollable?
     */
    scrollable: boolean;

    /**
     * Should this slide be scaleable?
     */
    scaleable: boolean;
}

/**
 * It is similar to router entries, so we can trick the router.
 */
export interface SlideManifest extends SlideConfiguration {
    path: string;
    loadChildren: LoadChildrenCallback;
    verboseName: string;
}

export const SLIDE_MANIFESTS = new InjectionToken<SlideManifest[]>('SLIDE_MANIFEST');
