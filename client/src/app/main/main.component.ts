import { Component, HostListener, OnInit } from '@angular/core';
import { ActivationEnd, Event, Router } from '@angular/router';

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
    selector: 'os-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent extends BaseComponent implements OnInit {
    /**
     * Hold the current routing data to make certain checks
     */
    private routingData: RoutingData | null = null;

    /**
     * Set to true if an update was suppressed
     */
    private delayedUpdateAvailable = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private updateService: UpdateService,
        private router: Router,
        private searchService: SuperSearchService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.updateService.updateObservable.subscribe(() => this.handleUpdate()),
            this.router.events.subscribe(routerEvent => this.handleRouterEvents(routerEvent))
        );
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
        const ref = this.matSnackBar.open(
            this.translate.instant('A new update is available!'),
            this.translate.instant('Refresh'),
            {
                duration: 0
            }
        );

        // Enforces an update
        ref.onAction().subscribe(() => {
            this.updateService.applyUpdate();
        });
    }

    /**
     * Function to open the global `super-search.component`.
     *
     * @param event KeyboardEvent to listen to keyboard-inputs.
     */
    @HostListener('document:keydown', ['$event']) public onKeyNavigation(event: KeyboardEvent): void {
        if (event.altKey && event.shiftKey && event.code === 'KeyF') {
            event.preventDefault();
            event.stopPropagation();
            this.searchService.open();
        }
    }
}
