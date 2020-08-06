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

    private _isBooted = false;
    /**
     * Saves, if OpenSlides is fully booted. This means, that a user must be logged in
     * (Anonymous is also a user in this case). This is the case after `afterLoginBootup`.
     */
    public get isBooted(): boolean {
        return this._isBooted;
    }

    public constructor() {}

    public bootup(): void {
        this._isBooted = false;
        this.openslidesBooted.next();
    }

    /**
     * Shuts down OpenSlides. The websocket connection is closed and the operator is not set.
     */
    public shutdown(): void {
        this._isBooted = false;
        this.openslidesShutdowned.next();
    }

    /**
     * Shutdown and bootup.
     */
    public reboot(): void {
        this.shutdown();
        this.bootup();
    }
}
