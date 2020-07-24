import { EventEmitter, Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { EndpointConfiguration } from './http-stream-endpoint.service';

export enum OfflineReasonValue {
    WhoAmIFailed,
    ConnectionLost
}

interface BaseOfflineReason {
    type: OfflineReasonValue;
}

export interface WhoAmIFailedOfflineReason extends BaseOfflineReason {
    type: OfflineReasonValue.WhoAmIFailed;
}

export interface ConnectionLostOfflineReason extends BaseOfflineReason {
    type: OfflineReasonValue.ConnectionLost;
    endpoint: EndpointConfiguration;
}

export type OfflineReason = WhoAmIFailedOfflineReason | ConnectionLostOfflineReason;

@Injectable({
    providedIn: 'root'
})
export class OfflineBroadcastService {
    private readonly _isOfflineSubject = new BehaviorSubject<boolean>(false);
    public get isOfflineObservable(): Observable<boolean> {
        return this._isOfflineSubject.asObservable();
    }

    private readonly _goOffline = new EventEmitter<OfflineReason>();
    public get goOfflineObservable(): Observable<OfflineReason> {
        return this._goOffline.asObservable();
    }

    private readonly _goOnline = new EventEmitter<void>();
    public get goOnlineObservable(): Observable<void> {
        return this._goOnline.asObservable();
    }

    public constructor() {}

    public goOffline(reason: OfflineReason): void {
        this._isOfflineSubject.next(true);
        this._goOffline.emit(reason);
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
