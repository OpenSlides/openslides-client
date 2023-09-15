import { Component, EmbeddedViewRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarRef as MatSnackBarRef } from '@angular/material/legacy-snack-bar';
import { ActivationEnd, Router } from '@angular/router';
import { SubscriptionMap } from 'src/app/infrastructure/utils/subscription-map';
import { ThemeService } from 'src/app/site/services/theme.service';

import { UpdateService } from '../../services/update.service';
import { VotingBannerService } from '../../services/voting-banner.service';

/**
 * Interface to describe possible routing data
 */
interface RoutingData {
    basePerm?: any;
    noInterruption?: boolean;
}

@Component({
    selector: `os-site-wrapper`,
    templateUrl: `./site-wrapper.component.html`,
    styleUrls: [`./site-wrapper.component.scss`]
})
export class SiteWrapperComponent implements OnInit, OnDestroy {
    @ViewChild(`updateNotificationTemplate`, { static: true })
    private _updateNotificationTemplate: TemplateRef<any>;

    /**
     * Set to true if an update was suppressed
     */
    private _delayedUpdateAvailable = false;

    /**
     * Hold the current routing data to make certain checks
     */
    private _routingData: RoutingData | null = null;

    private _globalSnackbarInstance: MatSnackBarRef<EmbeddedViewRef<any>> | null = null;

    private readonly _subscriptions = new SubscriptionMap();

    public constructor(
        _themeService: ThemeService, // just to initialize it
        _votingBannerService: VotingBannerService, // just to initialize it
        private snackbar: MatSnackBar,
        private updateService: UpdateService,
        private router: Router
    ) {}

    public ngOnInit(): void {
        this._subscriptions.push(
            this.updateService.updateObservable.subscribe(() => this.handleUpdate()),
            this.router.events.subscribe(routerEvent => this.handleRouterEvents(routerEvent as any))
        );
    }

    public ngOnDestroy(): void {
        this._subscriptions.clear();
    }

    public dismissSnackbar(): void {
        if (this._globalSnackbarInstance) {
            this._globalSnackbarInstance.dismiss();
            // Enforces an update
            this.updateService.applyUpdate();
        }
    }

    private handleRouterEvents(routerEvent: any): void {
        // detect routing data such as base perm and noInterruption
        if (routerEvent instanceof ActivationEnd && routerEvent.snapshot.children.length === 0) {
            this._routingData = routerEvent.snapshot.data;

            if (this._delayedUpdateAvailable && !this._routingData.noInterruption) {
                this.showUpdateNotification();
            }
        }
    }

    private handleUpdate(): void {
        if (this._routingData?.noInterruption) {
            this._delayedUpdateAvailable = true;
        } else {
            this.showUpdateNotification();
        }
    }

    private showUpdateNotification(): void {
        this._globalSnackbarInstance = this.snackbar.openFromTemplate(this._updateNotificationTemplate, {
            duration: 0
        });
    }
}
