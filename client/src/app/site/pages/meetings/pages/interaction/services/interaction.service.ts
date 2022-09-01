import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    map,
    merge,
    Observable
} from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { NotifyResponse, NotifyService } from '../../../../../../gateways/notify.service';
import { ViewUser } from '../../../view-models/view-user';
import { BroadcastService } from './broadcast.service';
import { CallRestrictionService } from './call-restriction.service';
import { InteractionServiceModule } from './interaction-service.module';
import { RtcService } from './rtc.service';
import { StreamService } from './stream.service';

export enum ConferenceState {
    none = 1,
    stream = 2,
    jitsi = 3
}

interface senderMessage {
    inviter: string;
}

interface kickMessage {
    reason: string;
}

const BroadcastMessageType = `callInteraction`;
const InviteMessage = `invitationToCall`;
const CallInviteTitle = _(`Please join the conference room now!`);
const KickMessage = `kickFromCall`;

@Injectable({
    providedIn: InteractionServiceModule
})
export class InteractionService {
    private conferenceStateSubject = new BehaviorSubject<ConferenceState>(ConferenceState.none);
    public conferenceStateObservable = this.conferenceStateSubject.asObservable();

    public showLiveConfObservable: Observable<boolean> = this.rtcService.isJitsiEnabledObservable;
    private get conferenceState(): ConferenceState {
        return this.conferenceStateSubject.value;
    }

    private isInCall: boolean = false;

    public get isConfStateStream(): Observable<boolean> {
        return this.conferenceStateObservable.pipe(map(state => state === ConferenceState.stream));
    }

    public get isConfStateJitsi(): Observable<boolean> {
        return this.conferenceStateObservable.pipe(map(state => state === ConferenceState.jitsi));
    }

    public get isConfStateNone(): Observable<boolean> {
        return this.conferenceStateObservable.pipe(map(state => state === ConferenceState.none));
    }

    private _kickObservable = this.notifyService.getMessageObservable<kickMessage>(KickMessage);

    public constructor(
        private streamService: StreamService,
        private rtcService: RtcService,
        private callRestrictionService: CallRestrictionService,
        private notifyService: NotifyService,
        private operator: OperatorService,
        private promptService: PromptService,
        private broadcast: BroadcastService
    ) {
        combineLatest([
            this.showLiveConfObservable,
            this.streamService.hasLiveStreamUrlObservable,
            this.streamService.canSeeLiveStreamObservable,
            this.rtcService.isJoinedObservable,
            this.rtcService.isJitsiActiveObservable,
            this.callRestrictionService.canEnterCallObservable
        ])
            .pipe(
                map(([showConf, hasStreamUrl, canSeeStream, inCall, jitsiActive, canEnterCall]) => {
                    this.isInCall = inCall || false;

                    /**
                     * most importantly, if there is a call, to not change the state here
                     */
                    if (inCall || jitsiActive) {
                        return undefined;
                    }
                    if (hasStreamUrl && canSeeStream) {
                        return ConferenceState.stream;
                    } else if (showConf && canEnterCall && (!hasStreamUrl || !canSeeStream)) {
                        return ConferenceState.jitsi;
                    } else {
                        return ConferenceState.none;
                    }
                })
            )
            .pipe(distinctUntilChanged())
            .subscribe(state => {
                if (state) {
                    this.setConferenceState(state);
                }
            });

        merge(
            this.callRestrictionService.hasToEnterCallObservable,
            this.notifyService.getMessageObservable<senderMessage>(InviteMessage).pipe(
                filter(message => message.sendByThisUser === false),
                map(message => message.message)
            )
        ).subscribe(() => {
            this.onCallInvite();
        });

        broadcast.get(BroadcastMessageType).subscribe(() => {
            this.promptService.close();
        });

        this._kickObservable.subscribe(response => this.onKickMessage(response));
    }

    public async enterCall(): Promise<void> {
        if (this.conferenceState !== ConferenceState.jitsi) {
            this.setConferenceState(ConferenceState.jitsi);
        }
    }

    public inviteToCall(userId: Id): void {
        const content: senderMessage = {
            inviter: this.operator.user.getShortName()
        };
        this.notifyService.sendToUsers(InviteMessage, content, userId);
    }

    public viewStream(): void {
        if (this.conferenceState !== ConferenceState.stream) {
            this.setConferenceState(ConferenceState.stream);
        }
    }

    public kickUsers(users: ViewUser[], reason?: string): void {
        this.notifyService.sendToUsers(KickMessage, { reason }, ...users.map(user => user.id));
    }

    private async onKickMessage(message: NotifyResponse<kickMessage>): Promise<void> {
        if (await firstValueFrom(this.rtcService.isJitsiActiveObservable)) {
            this.rtcService.stopJitsi();
        }
    }

    private setConferenceState(newState: ConferenceState): void {
        if (newState !== this.conferenceState) {
            this.conferenceStateSubject.next(newState);
        }
    }

    private async onCallInvite(): Promise<void> {
        if (!this.isInCall) {
            const accept = await this.promptService.open(CallInviteTitle);

            if (accept) {
                this.enterCall();
                this.rtcService.enterConferenceRoom();
            }

            this.broadcast.send({
                type: BroadcastMessageType,
                payload: null
            });
        }
    }
}
