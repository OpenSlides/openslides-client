import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

export interface OfflineReasonConfig {
    /**
     * The reason why we are offline
     */
    reason: string;
    /**
     * A function to check if we are online again. This has to return a boolean.
     */
    isOnlineFn: () => boolean | Promise<boolean>;
}

/**
 * This service handles the status being connected to the internet.
 */
@Injectable({
    providedIn: 'root'
})
export class ConnectionStatusService {
    public get offlineGone(): Observable<void> {
        return this.isOfflineObservable.pipe(
            filter(value => value === true),
            map(() => {})
        );
    }

    public get onlineGone(): Observable<void> {
        return this.isOfflineObservable.pipe(
            filter(value => value === false),
            map(() => {})
        );
    }

    public get isOfflineObservable(): Observable<boolean> {
        return this._isOfflineSubject.asObservable();
    }

    private readonly _isOfflineSubject = new BehaviorSubject(false);

    private _config: OfflineReasonConfig | null = null;

    public isOffline(): boolean {
        return this._isOfflineSubject.value;
    }

    /**
     * Helper function to set offline status
     */
    public goOffline(config: OfflineReasonConfig): void {
        if (null !== this._config) {
            return;
        }
        this._config = config;

        console.warn(`Offline because: ${config.reason}`);

        this.deferCheckStillOffline();
    }

    private deferCheckStillOffline(): void {
        const timeout = Math.floor(Math.random() * 3000 + 2000);
        console.warn(`Try to go online in ${timeout} ms`);

        setTimeout(async () => {
            // Verifies that we are (still) offline
            const isOnline = await this._config?.isOnlineFn();
            console.warn(`Is online again? ->`, isOnline);

            if (isOnline) {
                // stop trying.
                this._config = null;
                this._isOfflineSubject.next(false);
            } else {
                // continue trying.
                this.deferCheckStillOffline();
                this._isOfflineSubject.next(true);
            }
        }, timeout);
    }
}
