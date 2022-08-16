import { EventEmitter, Injectable } from '@angular/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { Deferred } from 'src/app/infrastructure/utils/promises';

@Injectable({
    providedIn: `root`
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

    /**
     * Returns a promise to wait until the lifecycle booted up.
     */
    public get booted(): Promise<void> {
        return this._booted;
    }

    private _booted = new Deferred();

    public constructor(private storageService: StorageService) {}

    public bootup(): void {
        this._isBooted = true;
        this._booted.resolve();
        console.debug(`Lifecycle: booted.`);
        this.openslidesBooted.next();
    }

    /**
     * Shuts down OpenSlides. The websocket connection is closed and the operator is not set.
     */
    public shutdown(): void {
        this._isBooted = false;
        this._booted.unresolve();
        console.debug(`Lifecycle: shutdown.`);
        this.openslidesShutdowned.next();
    }

    /**
     * Shutdown and bootup.
     */
    public reboot(): void {
        this.shutdown();
        this.bootup();
    }

    /**
     * Reboot while clearing the cache.
     */
    public async reset(): Promise<void> {
        this.shutdown();
        await this.storageService.clear();
        this.bootup();
    }
}
