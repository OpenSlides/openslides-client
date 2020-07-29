import { EventEmitter, Injectable } from '@angular/core';

/**
 * Provides fundamental hooks into the openslides lifecycle.
 */
@Injectable({
    providedIn: 'root'
})
export class LifecycleService {
    /**
     * This event is emitted, if the app becomes stable. It is ensured to happen after DomContentLoaded.
     * The event is also called in an async context to dispatch from the  main (sync) execution.
     */
    public readonly appLoaded = new EventEmitter<void>();

    /**
     * It is emitted, if openslides has booted: The user is authenticated and everything is ready to start.
     */
    public readonly openslidesBooted = new EventEmitter<void>();

    /**
     * OpenSlides is going down.
     */
    public readonly openslidesShutdowned = new EventEmitter<void>();

    public constructor() {}
}
