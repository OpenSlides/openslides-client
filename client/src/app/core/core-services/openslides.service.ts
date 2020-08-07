import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { DataStoreService } from './data-store.service';
import { LifecycleService } from './lifecycle.service';
import { OfflineBroadcastService, OfflineReasonValue } from './offline-broadcast.service';

/**
 * Handles the bootup/showdown of this application.
 */
@Injectable({
    providedIn: 'root'
})
export class OpenSlidesService {
    public constructor(
        private DS: DataStoreService,
        private offlineBroadcastService: OfflineBroadcastService,
        private lifecycleService: LifecycleService,
        private authService: AuthService
    ) {
        this.lifecycleService.appLoaded.subscribe(() => this.bootup());
    }

    /**
     * the bootup-sequence: Do a whoami request and if it was successful, do
     * {@method afterLoginBootup}. If not, redirect the user to the login page.
     */
    public async bootup(): Promise<void> {
        const online = await this.authService.doWhoAmIRequest();
        if (!online) {
            this.offlineBroadcastService.goOffline({
                type: OfflineReasonValue.WhoAmIFailed
            });
            return;
        }

        /*if (!this.operator.isAuthenticated) {
            if (!location.pathname.includes('error')) {
                this.authService.redirectUrl = location.pathname;
            }
            this.redirectToLoginIfNotSubpage();
        } else {
            this.afterAuthenticatedBootup();
        }*/

        this.DS.clear();
        this.lifecycleService.bootup();
    }
}
