import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
    public get isOfflineObservable(): Observable<boolean> {
        return this._isOfflineSubject.asObservable();
    }

    public get goOfflineObservable(): Observable<OfflineReasonConfig> {
        return this._goOffline.asObservable();
    }

    public get goOnlineObservable(): Observable<void> {
        return this._goOnline.asObservable();
    }

    private readonly _isOfflineSubject = new BehaviorSubject<boolean>(false);
    private readonly _goOnline = new EventEmitter<void>();
    private readonly _goOffline = new EventEmitter<OfflineReasonConfig>();

    public goOffline(config: OfflineReasonConfig): void {
        this._isOfflineSubject.next(true);
        this._goOffline.emit(config);
    }

    public goOnline(): void {
        this._isOfflineSubject.next(false);
        this._goOnline.emit();
    }

    public isOffline(): boolean {
        return this._isOfflineSubject.getValue();
    }

    public isOnline(): boolean {
        return !this.isOffline();
    }
}
