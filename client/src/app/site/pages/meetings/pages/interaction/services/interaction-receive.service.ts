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
    Observable,
    startWith,
    Subscription
} from 'rxjs';
import { NotifyService } from 'src/app/gateways/notify.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ActiveMeetingService } from '../../../services/active-meeting.service';
import { BroadcastService } from './broadcast.service';
import { CallRestrictionService } from './call-restriction.service';
import { ConferenceState, InviteMessage, KickMessage, kickMessage, senderMessage } from './interaction.service';
import { RtcService } from './rtc.service';
import { StreamService } from './stream.service';

export const BroadcastMessageType = `callInteraction`;
export const CallInviteTitle = _(`Please join the conference room now!`);

interface InteractionReceiveSetupServices {
    promptService: PromptService;
    broadcast: BroadcastService;
    streamService: StreamService;
    rtcService: RtcService;
    callRestrictionService: CallRestrictionService;
}

@Injectable({
    providedIn: `root`
})
export class InteractionReceiveService {
    private conferenceStateSubject = new BehaviorSubject<ConferenceState>(ConferenceState.none);
    public conferenceStateObservable = this.conferenceStateSubject as Observable<ConferenceState>;

    public get showLiveConfObservable(): Observable<boolean> {
        if (!this._showLiveConfObservable) {
            this._showLiveConfObservable = this.rtcService.isJitsiEnabledObservable;
        }
        return this._showLiveConfObservable;
    }
    private _showLiveConfObservable: Observable<boolean>;

    public get conferenceState(): ConferenceState {
        return this.conferenceStateSubject.value;
    }
    public set conferenceState(state: ConferenceState) {
        this.setConferenceState(state);
    }

    private isInCall = false;

    private get promptService(): PromptService {
        return this._lazyServices.promptService;
    }

    private get broadcast(): BroadcastService {
        return this._lazyServices.broadcast;
    }

    private get streamService(): StreamService {
        return this._lazyServices.streamService;
    }

    private get rtcService(): RtcService {
        return this._lazyServices.rtcService;
    }

    private get callRestrictionService(): CallRestrictionService {
        return this._lazyServices.callRestrictionService;
    }

    private _lazyServices: InteractionReceiveSetupServices;
    private _inviteSubscription: Subscription;

    private _kickObservable = this.notifyService.getMessageObservable<kickMessage>(KickMessage);

    constructor(private notifyService: NotifyService, private activeMeetingService: ActiveMeetingService) {}

    public startListening(lazyServices: InteractionReceiveSetupServices): void {
        if (!!this._inviteSubscription) {
            return;
        }
        this._lazyServices = lazyServices;
        this._inviteSubscription = combineLatest(
            [
                this.showLiveConfObservable,
                this.streamService.hasLiveStreamUrlObservable,
                this.streamService.canSeeLiveStreamObservable,
                this.rtcService.isJoinedObservable,
                this.rtcService.isJitsiActiveObservable,
                this.callRestrictionService.canEnterCallObservable
            ].map(observable => observable.pipe(startWith(false)))
        )
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
                filter(
                    message =>
                        message.sendByThisUser === false &&
                        message.message.meeting_id === this.activeMeetingService.meetingId
                ),
                map(message => message.message)
            )
        ).subscribe(() => {
            this.onCallInvite();
        });

        this.broadcast.get(BroadcastMessageType).subscribe(() => {
            this.promptService.close();
        });

        this._kickObservable.subscribe(() => this.onKickMessage());
    }

    public async enterCall(): Promise<void> {
        if (this.conferenceState !== ConferenceState.jitsi) {
            this.setConferenceState(ConferenceState.jitsi);
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

    private setConferenceState(newState: ConferenceState): void {
        if (newState !== this.conferenceState) {
            this.conferenceStateSubject.next(newState);
        }
    }

    private async onKickMessage(): Promise<void> {
        if (await firstValueFrom(this.rtcService.isJitsiActiveObservable)) {
            this.rtcService.stopJitsi();
        }
    }
}
