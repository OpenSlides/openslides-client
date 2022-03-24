import { Component, EmbeddedViewRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { ActivationEnd, Event, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { SuperSearchService } from 'app/core/ui-services/super-search.service';
import { UpdateService } from 'app/core/ui-services/update.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Interface to describe possible routing data
 */
interface RoutingData {
    basePerm?: any;
    noInterruption?: boolean;
}

@Component({
    selector: `os-main`,
    templateUrl: `./main.component.html`,
    styleUrls: [`./main.component.scss`]
})
export class MainComponent extends BaseComponent implements OnInit {
    @ViewChild(`updateNotificationTemplate`, { static: true })
    private _updateNotificationTemplate: TemplateRef<any>;

    /**
     * Hold the current routing data to make certain checks
     */
    private routingData: RoutingData | null = null;

    /**
     * Set to true if an update was suppressed
     */
    private delayedUpdateAvailable = false;

    private _globalSnackbarInstance: MatSnackBarRef<EmbeddedViewRef<any>> | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private updateService: UpdateService,
        private router: Router,
        private searchService: SuperSearchService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.updateService.updateObservable.subscribe(() => this.handleUpdate()),
            this.router.events.subscribe(routerEvent => this.handleRouterEvents(routerEvent))
        );
    }

    public dismissSnackbar(): void {
        if (this._globalSnackbarInstance) {
            this._globalSnackbarInstance.dismiss();
            // Enforces an update
            this.updateService.applyUpdate();
        }
    }

    private handleRouterEvents(routerEvent: Event): void {
        // detect routing data such as base perm and noInterruption
        if (routerEvent instanceof ActivationEnd && routerEvent.snapshot.children.length === 0) {
            this.routingData = routerEvent.snapshot.data;

            if (this.delayedUpdateAvailable && !this.routingData.noInterruption) {
                this.showUpdateNotification();
            }
        }
    }

    private handleUpdate(): void {
        if (this.routingData?.noInterruption) {
            this.delayedUpdateAvailable = true;
        } else {
            this.showUpdateNotification();
        }
    }

    private showUpdateNotification(): void {
        this._globalSnackbarInstance = this.matSnackBar.openFromTemplate(this._updateNotificationTemplate, {
            duration: 0
        });
    }

    /**
     * Function to open the global `super-search.component`.
     *
     * @param event KeyboardEvent to listen to keyboard-inputs.
     */
    @HostListener(`document:keydown`, [`$event`]) public onKeyNavigation(event: KeyboardEvent): void {
        if (event.altKey && event.shiftKey && event.code === `KeyF`) {
            event.preventDefault();
            event.stopPropagation();
            this.searchService.open();
        }
    }
}
