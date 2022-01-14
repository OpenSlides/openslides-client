import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/core-services/notify.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { BroadcastService } from 'app/core/services/broadcast.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { CallRestrictionService } from './call-restriction.service';
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

const BroadcastMessageType = `callInteraction`;
const InviteMessage = `invitationToCall`;
const CallInviteTitle = _(`Please join the conference room now!`);

@Injectable({
    providedIn: `root`
})
export class InteractionService {
    private conferenceStateSubject = new BehaviorSubject<ConferenceState>(ConferenceState.none);
    public conferenceStateObservable = this.conferenceStateSubject.asObservable();

    public showLiveConfObservable: Observable<boolean> = this.rtcService.isJitsiEnabledObservable;
    private get conferenceState(): ConferenceState {
        return this.conferenceStateSubject.value;
    }

    private isInCall: boolean;

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
        private streamService: StreamService,
        private rtcService: RtcService,
        private callRestrictionService: CallRestrictionService,
        private notifyService: NotifyService,
        private operator: OperatorService,
        private promptService: PromptService,
        private translate: TranslateService,
        private matSnackBar: MatSnackBar,
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
                    this.isInCall = inCall;

                    /**
                     * most importantly, if there is a call, to not change the state here
                     */
                    if (inCall || jitsiActive) {
                        return;
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
        ).subscribe(message => {
            this.onCallInvite(message);
        });

        broadcast.get(BroadcastMessageType).subscribe(message => {
            this.promptService.close();
        });
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

    private setConferenceState(newState: ConferenceState): void {
        if (newState !== this.conferenceState) {
            this.conferenceStateSubject.next(newState);
        }
    }

    private async onCallInvite(message?: senderMessage | void): Promise<void> {
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
