import { KeyValue } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';

import { ApplauseService } from '../../../../services/applause.service';
import { CallRestrictionService } from '../../../../services/call-restriction.service';
import { InteractionService } from '../../../../services/interaction.service';
import { ConferenceMember, ConferenceMemberCollection, RtcService } from '../../../../services/rtc.service';
import { StreamService } from '../../../../services/stream.service';

const helpDeskTitle = _(`Help desk`);
const liveConferenceTitle = _(`Conference room`);
const disconnectedTitle = _(`disconnected`);
const connectingTitle = _(`connecting ...`);

@Component({
    selector: `os-call`,
    templateUrl: `./call.component.html`,
    styleUrls: [`./call.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallComponent extends BaseMeetingComponent implements OnInit, AfterViewInit, OnDestroy {
    @Output()
    public conferenceTitle: EventEmitter<string> = new EventEmitter();

    @Output()
    public conferenceSubtitle: EventEmitter<string> = new EventEmitter();

    public isJitsiActiveInAnotherTab: Observable<boolean> = this.callRestrictionService.isJitsiActiveInAnotherTab;
    public canEnterCall: Observable<boolean> = this.callRestrictionService.canEnterCallObservable;
    public isJitsiDialogOpen: Observable<boolean> = this.rtcService.showCallDialogObservable;
    public showParticles: Observable<boolean> = this.applauseService.showParticles;
    public hasLiveStreamUrl: Observable<boolean> = this.streamService.hasLiveStreamUrlObservable;

    public isJitsiActive = false;
    public isJoined = false;

    private autoConnect = false;
    private dominantSpeaker: string | undefined;

    public get showHangUp(): boolean {
        return this.isJitsiActive && this.isJoined;
    }

    public get memberObservable(): Observable<ConferenceMemberCollection> {
        return this.rtcService.memberObservableObservable;
    }

    public get isDisconnected(): boolean {
        return !this.isJitsiActive && !this.isJoined;
    }

    public get isConnecting(): boolean {
        return this.isJitsiActive && !this.isJoined;
    }

    public get isConnected(): boolean {
        return this.isJitsiActive && this.isJoined;
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private callRestrictionService: CallRestrictionService,
        private rtcService: RtcService,
        private applauseService: ApplauseService,
        private interactionService: InteractionService,
        private streamService: StreamService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);

        this.subscriptions.push(
            this.rtcService.isJitsiActiveObservable.subscribe(active => {
                this.isJitsiActive = active;
                this.updateSubtitle();
                this.cd.markForCheck();
            }),

            this.rtcService.isJoinedObservable.subscribe(isJoined => {
                this.isJoined = isJoined;
                this.updateSubtitle();
                this.cd.markForCheck();
            }),

            this.rtcService.dominantSpeakerObservable.subscribe(domSpeaker => {
                this.dominantSpeaker = domSpeaker?.displayName;
                this.updateSubtitle();
                this.cd.markForCheck();
            }),

            this.rtcService.autoConnect.subscribe(auto => {
                this.autoConnect = auto;
            }),

            this.rtcService.connectedToHelpDesk.subscribe(onHelpDesk => {
                if (onHelpDesk) {
                    this.conferenceTitle.next(helpDeskTitle);
                } else {
                    this.conferenceTitle.next(liveConferenceTitle);
                }
                this.cd.markForCheck();
            })
        );
    }

    // closing the tab should also try to stop jitsi.
    // this will usually not be caught by ngOnDestroy
    @HostListener(`window:unload`)
    public beforeunload(): void {
        this.rtcService.stopJitsi();
    }

    public ngOnInit(): void {
        this.updateSubtitle();
    }

    public ngAfterViewInit(): void {
        if (this.autoConnect) {
            this.callRoom();
        }
    }

    public valueNameOrder = (a: KeyValue<number, ConferenceMember>, b: KeyValue<number, ConferenceMember>): number =>
        a.value.name.localeCompare(b.value.name);

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.rtcService.stopJitsi();
    }

    public async callRoom(): Promise<void> {
        await this.rtcService.enterConferenceRoom().catch(this.raiseError);
        this.cd.markForCheck();
    }

    public forceStart(): void {
        this.rtcService.enterConferenceRoom(true).catch(this.raiseError);
        this.cd.markForCheck();
    }

    public hangUp(): void {
        this.rtcService.stopJitsi();
        this.cd.markForCheck();
    }

    public viewStream(): void {
        this.interactionService.viewStream();
    }

    private updateSubtitle(): void {
        if (this.isJitsiActive && this.isJoined) {
            this.conferenceSubtitle.next(this.dominantSpeaker || ``);
        } else if (this.isJitsiActive && !this.isJoined) {
            this.conferenceSubtitle.next(connectingTitle);
        } else {
            this.conferenceSubtitle.next(disconnectedTitle);
        }
    }
}
