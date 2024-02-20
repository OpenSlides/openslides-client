import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, Observable, Subject } from 'rxjs';
import { StorageService } from 'src/app/gateways/storage.service';

@Injectable({
    providedIn: `root`
})
export class UpdateService {
    /**
     * @returns the updateSubscription
     */
    public get updateObservable(): Observable<void> {
        return this._nextVersionAvailableSubject;
    }

    private _nextVersionAvailableSubject = new Subject<void>();

    /**
     * Constructor.
     * Listens to available updates
     *
     * @param swUpdate Service Worker update service
     */
    public constructor(private swUpdate: SwUpdate, private store: StorageService) {
        swUpdate.versionUpdates
            .pipe(filter(event => event.type === `VERSION_READY`))
            .subscribe((version: VersionReadyEvent) => this.checkVersion(version));
    }

    /**
     * Manually applies the update if one was found
     */
    public async applyUpdate(): Promise<void> {
        if (await this.swUpdate.activateUpdate()) {
            console.warn(`RELOAD`);
            if (confirm()) {
                document.location.reload();
                this.store.clear();
            }
        }
    }

    /**
     * Trigger that to manually check for updates
     */
    public async checkForUpdate(): Promise<boolean> {
        if (this.swUpdate.isEnabled) {
            try {
                return await this.swUpdate.checkForUpdate();
            } catch (e) {
                return false;
            }
        }

        return false;
    }

    private checkVersion(version: VersionReadyEvent): void {
        const currentVersion = version.currentVersion.hash;
        const latestVersion = version.latestVersion.hash;
        const isUpdateAvailable = currentVersion !== latestVersion;
        console.log(`Current version: ${currentVersion}.\n Latest version: ${latestVersion}`);
        console.log(isUpdateAvailable ? `Update available` : `No update available`);
        if (isUpdateAvailable) {
            this._nextVersionAvailableSubject.next();
        }
    }
}
