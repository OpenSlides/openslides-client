import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateAvailableEvent, SwUpdate } from '@angular/service-worker';
import { SiteWrapperServiceModule } from './site-wrapper-service.module';

@Injectable({
    providedIn: SiteWrapperServiceModule
})
export class UpdateService {
    /**
     * @returns the updateSubscription
     */
    public get updateObservable(): Observable<UpdateAvailableEvent> {
        return this.swUpdate.available;
    }

    /**
     * Constructor.
     * Listens to available updates
     *
     * @param swUpdate Service Worker update service
     */
    public constructor(private swUpdate: SwUpdate) {}

    /**
     * Manually applies the update if one was found
     */
    public applyUpdate(): void {
        this.swUpdate.activateUpdate().then(() => {
            document.location.reload();
        });
    }

    /**
     * Trigger that to manually check for updates
     */
    public checkForUpdate(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.checkForUpdate();
        }
    }
}
