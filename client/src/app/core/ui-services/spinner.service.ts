import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { SpinnerComponent } from 'app/shared/components/spinner/spinner.component';
import { combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { DataStoreUpgradeService } from '../core-services/data-store-upgrade.service';
import { OfflineService } from '../core-services/offline.service';
import { OperatorService } from '../core-services/operator.service';
import { CustomOverlayConfig, OverlayInstance, OverlayService } from './overlay.service';

export interface SpinnerConfig extends CustomOverlayConfig {
    /**
     * The spinner-service will automatically detect when OpenSlides is stable. Then a spinner-instance will be hidden.
     * If OpenSlides is already stable, a spinner will not be shown.
     */
    hideWhenStable?: boolean;
    /**
     * Pass a function that returns a promise, which will be executed and await for. After the promise resolved, the
     * current spinner is automatically be hidden.
     */
    hideAfterPromiseResolved?: () => Promise<any>;
}

@Injectable({
    providedIn: `root`
})
export class SpinnerService {
    private overlayInstance: OverlayInstance<SpinnerComponent> | null = null;

    private isOperatorReady = false;
    private hasUpgradeChecked = false;
    private isOffline = false;
    private isOnLoginMask = false;

    private isStableSubscription: Subscription | null = null;

    public constructor(
        private overlay: OverlayService,
        private upgradeService: DataStoreUpgradeService,
        private offlineService: OfflineService,
        private operator: OperatorService,
        private router: Router
    ) {}

    public show(text?: string, config: SpinnerConfig = {}): OverlayInstance<SpinnerComponent> {
        if (this.overlayInstance) {
            return this.overlayInstance; // Prevent multiple instances at the same time.
        }
        this.overlayInstance = this.overlay.open(SpinnerComponent, {
            ...config,
            onCloseFn: () => (this.overlayInstance = null),
            data: {
                text
            }
        });
        if (config.hideWhenStable) {
            this.initStableSubscription();
        } else if (config.hideAfterPromiseResolved) {
            this.initPromise(config.hideAfterPromiseResolved);
        }
        return this.overlayInstance;
    }

    public hide(): void {
        if (this.overlayInstance) {
            this.overlayInstance.close();
            this.overlayInstance = null;
        }
    }

    /**
     * Checks, if the connection is stable.
     * This relates to `appStable`, `booted` and `user || anonymous`.
     *
     * @returns True, if the three booleans are all true.
     */
    public isConnectionStable(): boolean {
        return this.isOnLoginMask || (this.isOperatorReady && (this.isOffline || this.hasUpgradeChecked));
    }

    /**
     * Function to check, if the app is stable and, if true, hide the spinner.
     */
    private checkConnection(): void {
        if (this.isConnectionStable()) {
            this.hide();
            this.cleanupStableSubscription();
        }
    }

    private initStableSubscription(): void {
        this.isStableSubscription = combineLatest([
            this.operator.isReadyObservable,
            this.offlineService.isOfflineObservable,
            this.upgradeService.upgradeChecked.pipe(distinctUntilChanged()),
            this.router.events.pipe(filter(event => event instanceof RoutesRecognized))
        ]).subscribe(([isReady, isOffline, hasUpgradeChecked, event]) => {
            this.isOperatorReady = isReady;
            this.isOffline = isOffline;
            this.hasUpgradeChecked = hasUpgradeChecked;
            this.isOnLoginMask = (event as RoutesRecognized).url.includes(`login`);
            this.checkConnection();
        });
    }

    private async initPromise(promiseFn: () => Promise<any>): Promise<void> {
        try {
            await promiseFn();
        } catch (e) {
            console.error(e);
        }
        this.hide();
    }

    private cleanupStableSubscription(): void {
        if (this.isStableSubscription) {
            this.isStableSubscription.unsubscribe();
            this.isStableSubscription = null;
        }
    }
}
