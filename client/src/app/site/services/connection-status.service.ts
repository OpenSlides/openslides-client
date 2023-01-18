import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BehaviorSubject, filter, fromEvent, map, Observable } from 'rxjs';

import { BannerDefinition, BannerService } from '../modules/site-wrapper/services/banner.service';

export interface OfflineReasonConfig {
    /**
     * The reason why we are offline
     */
    reason: string;
    /**
     * A function to check if we are online again. This has to return a boolean.
     */
    isOnlineFn: () => boolean | Promise<boolean> | Observable<boolean>;
}

const DEFAULT_OFFLINE_REASON: OfflineReasonConfig = {
    reason: `Connection lost`,
    isOnlineFn: () => fromEvent(window, `online`).pipe(map(event => !!event))
};

const OFFLINE_BANNER: BannerDefinition = {
    text: _(`Offline mode`),
    icon: `cloud_off`
};

/**
 * This service handles the status being connected to the internet.
 */
@Injectable({
    providedIn: `root`
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

    public constructor(private bannerService: BannerService) {
        fromEvent(window, `offline`).subscribe(() => this.goOffline(DEFAULT_OFFLINE_REASON));
    }

    public getReason(): string {
        return this._config?.reason || null;
    }

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
        this._isOfflineSubject.next(true);
        this.bannerService.addBanner(OFFLINE_BANNER);
        if (this._config?.isOnlineFn instanceof Observable) {
            const subscription = this._config.isOnlineFn.subscribe(is => {
                if (is) {
                    this.goOnline();
                    subscription.unsubscribe();
                }
            });
        } else {
            const timeout = Math.floor(Math.random() * 3000 + 2000);
            console.warn(`Try to go online in ${timeout} ms`);
            setTimeout(async () => {
                // Verifies that we are (still) offline
                const isOnline = await this._config?.isOnlineFn();
                console.warn(`Is online again? ->`, isOnline);

                if (isOnline) {
                    this.goOnline();
                } else {
                    // continue trying.
                    this.deferCheckStillOffline();
                }
            }, timeout);
        }
    }

    private goOnline(): void {
        // stop trying.
        this._config = null;
        this._isOfflineSubject.next(false);
        this.bannerService.removeBanner(OFFLINE_BANNER);
    }
}
