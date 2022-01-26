import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Deferred } from '../promises/deferred';

/**
 * Provides fundamental hooks into the openslides lifecycle.
 */
@Injectable({
    providedIn: `root`
})
export class LifecycleService {
    /**
     * This event is emitted, if the app becomes stable. It is ensured to happen after DomContentLoaded.
     * The event is also called in an async context to dispatch from the  main (sync) execution.
     */
    public get appLoaded(): Observable<void> {
        return this._appLoadingSubject.asObservable();
    }

    /**
     * It is emitted, if openslides has booted: The user is authenticated and everything is ready to start.
     */
    public get openslidesBooted(): Observable<void> {
        return this._bootingSubject.asObservable();
    }

    /**
     * OpenSlides is going down.
     */
    public get openslidesShutdowned(): Observable<void> {
        return this._shutdowningSubject.asObservable();
    }

    private _isBooted = false;
    /**
     * Saves, if OpenSlides is fully booted. This means, that a user must be logged in
     * (Anonymous is also a user in this case). This is the case after `afterLoginBootup`.
     */
    public get isBooted(): boolean {
        return this._isBooted;
    }

    /**
     * Returns a promise to wait until the lifecycle booted up.
     */
    public get booted(): Promise<void> {
        return this._booted;
    }

    private _booted = new Deferred();
    private _hasLoaded = false;

    private readonly _appLoadingSubject = new Subject<void>();
    private readonly _bootingSubject = new Subject<void>();
    private readonly _shutdowningSubject = new Subject<void>();

    public finishLoading(): void {
        if (this._hasLoaded) {
            throw new Error(`Lifecycle has already loaded yet!`);
        }
        this._hasLoaded = true;
        this._appLoadingSubject.next();
    }

    public bootup(): void {
        this._isBooted = true;
        this._booted.resolve();
        console.debug(`Lifecycle: booted.`);
        this._bootingSubject.next();
    }

    /**
     * Shuts down OpenSlides. The websocket connection is closed and the operator is not set.
     */
    public shutdown(): void {
        this._isBooted = false;
        this._booted = new Deferred();
        console.debug(`Lifecycle: shutdown.`);
        this._shutdowningSubject.next();
    }

    /**
     * Shutdown and bootup.
     */
    public reboot(): void {
        this.shutdown();
        this.bootup();
    }
}
