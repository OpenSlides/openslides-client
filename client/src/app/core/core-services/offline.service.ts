import { Injectable } from '@angular/core';

import { HttpStreamEndpointService } from './http-stream-endpoint.service';
import { OfflineBroadcastService, OfflineReason, OfflineReasonValue } from './offline-broadcast.service';
import { OpenSlidesService } from './openslides.service';
import { OperatorService, WhoAmI } from './operator.service';

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
        private operatorService: OperatorService,
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
            let whoami: WhoAmI | null = null;

            if (this.reason.type === OfflineReasonValue.ConnectionLost) {
                online = await this.httpEnpointService.isEndpointHealthy(this.reason.endpoint);
                console.log('is communication online to', this.reason.endpoint, '->', online);
            } else if (this.reason.type === OfflineReasonValue.WhoAmIFailed) {
                const result = await this.operatorService.doWhoAmIRequest();
                online = result.online;
                whoami = result.whoami;
                console.log('is whoami reachable?', online);
            }

            if (online) {
                await this.goOnline(whoami);
                // stop trying.
            } else {
                // continue trying.
                this.deferCheckStillOffline();
            }
        }, timeout);
    }

    /**
     * Function to return to online-status.
     *
     * If not WhoAmI was the problem, check it. This results in definetly having a whoami
     * response at this point. We need to setup everything again:
     * 1) check the operator. If this allowes for an logged in state (or anonymous is OK), do
     *    step 2, otherwise done.
     * 2) enable communications.
     */
    private async goOnline(whoami?: WhoAmI): Promise<void> {
        console.log('go online!', this.reason, whoami);
        if (this.reason.type === OfflineReasonValue.ConnectionLost) {
            // now we have to check whoami
            const result = await this.operatorService.doWhoAmIRequest();
            if (!result.online) {
                console.log('whoami down.');
                this.reason = {
                    type: OfflineReasonValue.WhoAmIFailed
                };
                this.deferCheckStillOffline();
                return;
            }
            whoami = result.whoami;
        }
        console.log('we are online!', whoami);

        // Ok, we are online now!
        await this.OpenSlides.checkWhoAmI(whoami);
        this.reason = null;

        this.offlineBroadcastService.goOnline();
    }
}
