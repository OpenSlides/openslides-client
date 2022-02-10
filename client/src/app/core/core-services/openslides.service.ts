import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { LifecycleService } from './lifecycle.service';
import { OfflineService } from './offline.service';
import { OpenSlidesRouterService } from './openslides-router.service';

const WHOAMI_FAILED = `WhoAmI failed`;

/**
 * Handles the bootup/showdown of this application.
 */
@Injectable({
    providedIn: `root`
})
export class OpenSlidesService {
    public constructor(
        private offlineService: OfflineService,
        private lifecycleService: LifecycleService,
        private authService: AuthService,
        private osRouter: OpenSlidesRouterService
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
            this.offlineService.goOffline({
                reason: WHOAMI_FAILED,
                isOnlineFn: async () => this.authService.doWhoAmIRequest()
            });
            return;
        }

        if (!this.authService.isAuthenticated()) {
            this.osRouter.navigateToLogin();
        }

        this.lifecycleService.reboot();
    }
}
