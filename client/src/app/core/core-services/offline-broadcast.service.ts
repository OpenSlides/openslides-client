import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OfflineReasonConfig {
    /**
     * The reason why we are offline
     */
    reason: string;
    /**
     * A function to check if we are online again. This has to return a boolean.
     */
    isOnlineFn: () => boolean | Promise<boolean>;
}

@Injectable({
    providedIn: `root`
})
export class OfflineBroadcastService {
    public readonly isOfflineSubject = new BehaviorSubject<boolean>(false);
    public readonly goOnlineEvent = new EventEmitter<void>();
    public readonly goOfflineEvent = new EventEmitter<OfflineReasonConfig>();

    public isOffline(): boolean {
        return this.isOfflineSubject.getValue();
    }

    public isOnline(): boolean {
        return !this.isOffline();
    }
}
