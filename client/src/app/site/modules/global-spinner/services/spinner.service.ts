import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { combineLatest, filter, startWith, Subscription } from 'rxjs';
import { ConnectionStatusService } from 'src/app/site/services/connection-status.service';
import { OpenSlidesStatusService } from 'src/app/site/services/openslides-status.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { OverlayInstance, OverlayService } from 'src/app/ui/modules/openslides-overlay';

import { GlobalSpinnerComponent } from '../components/global-spinner/global-spinner.component';
import { SpinnerConfig } from '../definitions';
import { GlobalSpinnerModule } from '../global-spinner.module';

@Injectable({
    providedIn: GlobalSpinnerModule
})
export class SpinnerService {
    public get isOffline(): boolean {
        return this._isOffline;
    }

    private overlayInstance: OverlayInstance<GlobalSpinnerComponent> | null = null;

    private isOperatorReady = false;
    private isStable = false;
    private _isOffline = false;
    private isOnLoginMask = false;
    private isOnErrorPage = false;

    private set isOffline(isOffline: boolean) {
        this._isOffline = isOffline;
    }

    private isStableSubscription: Subscription | null = null;

    public constructor(
        private overlay: OverlayService,
        private offlineService: ConnectionStatusService,
        private openslidesStatus: OpenSlidesStatusService,
        private operator: OperatorService,
        private router: Router
    ) {}

    public show(text?: string, config: SpinnerConfig = {}): OverlayInstance<GlobalSpinnerComponent> {
        if (this.overlayInstance) {
            return this.overlayInstance; // Prevent multiple instances at the same time.
        }
        this.overlayInstance = this.overlay.open(GlobalSpinnerComponent, {
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
        return this.isOnLoginMask || this.isOnErrorPage || (this.isOperatorReady && (this.isOffline || this.isStable));
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
            this.openslidesStatus.isStableObservable,
            this.router.events.pipe(filter(event => event instanceof RoutesRecognized)).pipe(startWith(null))
        ]).subscribe(([isReady, isOffline, isStable, event]) => {
            this.isOperatorReady = isReady;
            this.isOffline = isOffline;
            this.isStable = isStable;
            if (event) {
                this.isOnLoginMask = (event as RoutesRecognized).url.includes(`login`);
                this.isOnErrorPage = (event as RoutesRecognized).url.includes(`error`);
            }

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
