import { Injectable } from '@angular/core';

import { OfflineBroadcastService, OfflineReasonConfig } from './offline-broadcast.service';

/**
 * This service handles everything connected with being offline.
 *
 * TODO: This is just a stub. Needs to be done in the future; Maybe we cancel this whole concept
 * of this service. We'll see what happens here..
 */
@Injectable({
    providedIn: `root`
})
export class OfflineService {
    private config: OfflineReasonConfig | null = null;

    public constructor(private offlineBroadcastService: OfflineBroadcastService) {
        this.offlineBroadcastService.goOfflineEvent.subscribe(reason => this.goOffline(reason));
    }

    /**
     * Helper function to set offline status
     */
    private goOffline(config: OfflineReasonConfig): void {
        if (null !== this.config) {
            return;
        }
        this.config = config;

        console.log(`Offline because: ${config.reason}`);

        this.deferCheckStillOffline();
    }

    private deferCheckStillOffline(): void {
        const timeout = Math.floor(Math.random() * 3000 + 2000);
        console.log(`Try to go online in ${timeout} ms`);

        setTimeout(async () => {
            // Verifies that we are (still) offline
            const isOnline = await this.config.isOnlineFn();
            console.log(`Is online again? ->`, isOnline);

            if (isOnline) {
                // stop trying.
                this.config = null;
                this.offlineBroadcastService.isOfflineSubject.next(false);
            } else {
                // continue trying.
                this.deferCheckStillOffline();
                this.offlineBroadcastService.isOfflineSubject.next(true);
            }
        }, timeout);
    }
}
