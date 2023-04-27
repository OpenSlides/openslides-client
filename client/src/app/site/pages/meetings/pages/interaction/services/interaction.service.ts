import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { NotifyService } from 'src/app/gateways/notify.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ActiveMeetingService } from '../../../services/active-meeting.service';
import { ViewUser } from '../../../view-models/view-user';
import { BroadcastService } from './broadcast.service';
import { CallRestrictionService } from './call-restriction.service';
import { InteractionReceiveService } from './interaction-receive.service';
import { InteractionServiceModule } from './interaction-service.module';
import { RtcService } from './rtc.service';
import { StreamService } from './stream.service';

export enum ConferenceState {
    none = 1,
    stream = 2,
    jitsi = 3
}

export interface senderMessage {
    inviter: string;
    meeting_id: number;
}

export interface kickMessage {
    reason: string;
}

export const InviteMessage = `invitationToCall`;
export const KickMessage = `kickFromCall`;

@Injectable({
    providedIn: InteractionServiceModule
})
export class InteractionService {
    public conferenceStateObservable = this.interactionReceive.conferenceStateObservable;

    public get showLiveConfObservable(): Observable<boolean> {
        return this.interactionReceive.showLiveConfObservable;
    }

    private get conferenceState(): ConferenceState {
        return this.interactionReceive.conferenceState;
    }
    private set conferenceState(state: ConferenceState) {
        this.interactionReceive.conferenceState = state;
    }

    public get isConfStateStream(): Observable<boolean> {
        return this.conferenceStateObservable.pipe(map(state => state === ConferenceState.stream));
    }

    public get isConfStateJitsi(): Observable<boolean> {
        return this.conferenceStateObservable.pipe(map(state => state === ConferenceState.jitsi));
    }

    public get isConfStateNone(): Observable<boolean> {
        return this.conferenceStateObservable.pipe(map(state => state === ConferenceState.none));
    }

    public constructor(
        streamService: StreamService,
        rtcService: RtcService,
        callRestrictionService: CallRestrictionService,
        private notifyService: NotifyService,
        private operator: OperatorService,
        promptService: PromptService,
        broadcast: BroadcastService,
        private interactionReceive: InteractionReceiveService,
        private activeMeetingService: ActiveMeetingService
    ) {
        interactionReceive.startListening({
            streamService,
            rtcService,
            callRestrictionService,
            promptService,
            broadcast
        });
    }

    public async enterCall(): Promise<void> {
        this.conferenceState = ConferenceState.jitsi;
    }

    public inviteToCall(userId: Id): void {
        const content: senderMessage = {
            inviter: this.operator.user.getShortName(),
            meeting_id: this.activeMeetingService.meetingId
        };
        this.notifyService.sendToUsers(InviteMessage, content, userId);
    }

    public viewStream(): void {
        this.conferenceState = ConferenceState.stream;
    }

    public kickUsers(users: ViewUser[], reason?: string): void {
        this.notifyService.sendToUsers(KickMessage, { reason }, ...users.map(user => user.id));
    }
}
