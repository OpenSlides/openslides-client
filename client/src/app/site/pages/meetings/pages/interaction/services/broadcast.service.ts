import { Injectable } from '@angular/core';
import { BroadcastChannel } from 'broadcast-channel';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { InteractionServiceModule } from './interaction-service.module';

/**
 * Implements the BroadcastChannel API.
 * Documentation at mdb:
 * https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
 *
 * At the time being, this might not work on safari
 * https://caniuse.com/broadcastchannel
 */

export interface BroadcastMessage {
    type: string;
    payload: any;
}

const BroadcastChannelName = `OpenSlidesBrowserBroadcast`;

@Injectable({
    providedIn: InteractionServiceModule
})
export class BroadcastService {
    private broadcastChannel: BroadcastChannel;
    private onMessage = new Subject<any>();

    public constructor() {
        this.broadcastChannel = new BroadcastChannel(BroadcastChannelName);
        this.broadcastChannel.onmessage = message => this.onMessage.next(message.data);
    }

    public send(message: BroadcastMessage): void {
        this.broadcastChannel.postMessage(message);
    }

    public get(type: string): Observable<BroadcastMessage> {
        return this.onMessage.pipe(filter(message => message.type === type));
    }
}
