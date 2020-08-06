import { Injectable } from '@angular/core';

import { HttpStreamEndpointService } from './http-stream-endpoint.service';
import { OfflineBroadcastService, OfflineReason, OfflineReasonValue } from './offline-broadcast.service';
import { OpenSlidesService } from './openslides.service';
import { AuthService } from './auth.service';

/**
 * This service handles everything connected with being offline.
 *
 * TODO: This is just a stub. Needs to be done in the future; Maybe we cancel this whole concept
 * of this service. We'll see what happens here..
 */
@Injectable({
    providedIn: 'root'
})
export class OfflineService {
    private reason: OfflineReason | null = null;

    public constructor(
        private OpenSlides: OpenSlidesService,
        private offlineBroadcastService: OfflineBroadcastService,
        private authService: AuthService,
        private httpEnpointService: HttpStreamEndpointService
    ) {
        this.offlineBroadcastService.goOfflineObservable.subscribe((reason: OfflineReason) => this.goOffline(reason));
    }

    /**
     * Helper function to set offline status
     */
    public goOffline(reason: OfflineReason): void {
        if (null !== this.reason) {
            return;
        }
        this.reason = reason;

        if (reason.type === OfflineReasonValue.ConnectionLost) {
            console.log('offline because connection lost to', reason.endpoint);
        } else if (reason.type === OfflineReasonValue.WhoAmIFailed) {
            console.log('offline because whoami failed.');
        } else {
            throw new Error('Offline and no reason....');
        }

        this.offlineBroadcastService.goOffline(reason);
        this.deferCheckStillOffline();
    }

    private deferCheckStillOffline(): void {
        const timeout = Math.floor(Math.random() * 3000 + 2000);
        console.log(`Try to go online in ${timeout} ms`);

        setTimeout(async () => {
            let online: boolean;

            if (this.reason.type === OfflineReasonValue.ConnectionLost) {
                online = await this.httpEnpointService.isEndpointHealthy(this.reason.endpoint);
                console.log('is communication online to', this.reason.endpoint, '->', online);
            } else if (this.reason.type === OfflineReasonValue.WhoAmIFailed) {
                online = await this.authService.doWhoAmIRequest();
                console.log('is whoami reachable?', online);
            }

            if (online) {
                // stop trying.
                this.reason = null;
                this.offlineBroadcastService.goOnline();
            } else {
                // continue trying.
                this.deferCheckStillOffline();
            }
        }, timeout);
    }
}
