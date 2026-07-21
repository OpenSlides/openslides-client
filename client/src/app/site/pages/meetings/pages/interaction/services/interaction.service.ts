import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { NotifyService } from '@app/gateways/notify.service';
import { OperatorService } from '@app/site/services/operator.service';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { map, Observable } from 'rxjs';

import { ActiveMeetingService } from '../../../services/active-meeting.service';
import { ViewUser } from '../../../view-models/view-user';
import { BroadcastService } from './broadcast.service';
import { CallRestrictionService } from './call-restriction.service';
import { InteractionReceiveService } from './interaction-receive.service';
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

@Service()
export class InteractionService {
    private notifyService = inject(NotifyService);
    private operator = inject(OperatorService);
    private interactionReceive = inject(InteractionReceiveService);
    private activeMeetingService = inject(ActiveMeetingService);

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

    public constructor() {
        const streamService = inject(StreamService);
        const rtcService = inject(RtcService);
        const callRestrictionService = inject(CallRestrictionService);
        const promptService = inject(PromptService);
        const broadcast = inject(BroadcastService);
        this.interactionReceive.startListening({
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
