import { ChangeDetectionStrategy, Component } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';
import { fadeInAnim, fadeInOutAnim } from 'src/app/infrastructure/animations';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { InteractionService } from 'src/app/site/pages/meetings/pages/interaction/services/interaction.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';

import { ApplauseService } from '../../../../services/applause.service';
import { CallRestrictionService } from '../../../../services/call-restriction.service';
import { RtcService } from '../../../../services/rtc.service';

@Component({
    selector: `os-action-bar`,
    templateUrl: `./action-bar.component.html`,
    styleUrls: [`./action-bar.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeInAnim, fadeInOutAnim]
})
export class ActionBarComponent extends BaseMeetingComponent {
    public canEnterTooltip = _(`Enter conference room`);
    public cannotEnterTooltip = _(`Add yourself to the current list of speakers to join the conference`);

    public showApplause: Observable<boolean> = this.applauseService.showApplauseObservable;

    public showApplauseLevel = this.applauseService.showApplauseLevelObservable;
    public applauseLevel: Observable<number> = this.applauseService.applauseLevelObservable;

    public sendsApplause: Observable<boolean> = this.applauseService.sendsApplauseObservable;
    public isJoined: Observable<boolean> = this.rtcService.isJoinedObservable;
    public showCallDialog: Observable<boolean> = this.rtcService.showCallDialogObservable;
    public showLiveConf: Observable<boolean> = this.interactionService.showLiveConfObservable;

    public canEnterCall: Observable<boolean> = this.callRestrictionService.canEnterCallObservable;

    /**
     * for the pulse animation
     */
    public enterCallAnimHelper = true;
    public meetingActiveAnimHelper = true;

    public get isConfStateStream(): Observable<boolean> {
        return this.interactionService.isConfStateStream;
    }

    public get isConfStateJitsi(): Observable<boolean> {
        return this.interactionService.isConfStateJitsi;
    }

    public get isConfStateNone(): Observable<boolean> {
        return this.interactionService.isConfStateNone;
    }

    public get showHelpDesk(): Observable<boolean> {
        return combineLatest([this.rtcService.isSupportEnabled, this.isJoined]).pipe(
            map(([isSupportEnabled, isJoined]) => isSupportEnabled && !isJoined)
        );
    }

    public constructor(
        protected override translate: TranslateService,
        private callRestrictionService: CallRestrictionService,
        private interactionService: InteractionService,
        private rtcService: RtcService,
        private applauseService: ApplauseService
    ) {
        super();
    }

    public async enterConferenceRoom(): Promise<void> {
        this.interactionService
            .enterCall()
            .then(() => this.rtcService.enterConferenceRoom())
            .catch(this.raiseError);
    }

    public enterSupportRoom(): void {
        this.interactionService
            .enterCall()
            .then(() => this.rtcService.enterSupportRoom())
            .catch(this.raiseError);
    }

    public maximizeCallDialog(): void {
        this.rtcService.showCallDialog = true;
    }

    public sendApplause(): void {
        this.applauseService.sendApplause();
    }

    public triggerCallHiddenAnimation(): void {
        this.meetingActiveAnimHelper = !this.meetingActiveAnimHelper;
    }
}
