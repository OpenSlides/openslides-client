import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { fadeInAnim, fadeInOutAnim } from 'app/shared/animations';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { CURRENT_LIST_OF_SPEAKERS_FOLLOW } from 'app/site/projector/services/current-list-of-speakers.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApplauseService } from '../../services/applause.service';
import { CallRestrictionService } from '../../services/call-restriction.service';
import { InteractionService } from '../../services/interaction.service';
import { RtcService } from '../../services/rtc.service';

@Component({
    selector: `os-action-bar`,
    templateUrl: `./action-bar.component.html`,
    styleUrls: [`./action-bar.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeInAnim, fadeInOutAnim]
})
export class ActionBarComponent extends BaseModelContextComponent {
    public canEnterTooltip = _(`Enter conference room`);
    public cannotEnterTooltip = _(`Add yourself to the current list of speakers to join the conference`);

    public showApplause: Observable<boolean> = this.applauseService.showApplauseObservable;

    public showApplauseLevel = this.applauseService.showApplauseLevelObservable;
    public applauseLevel: Observable<number> = this.applauseService.applauseLevelObservable;

    public sendsApplause: Observable<boolean> = this.applauseService.sendsApplauseObservable;
    public isJoined: Observable<boolean> = this.rtcService.isJoinedObservable;
    public showCallDialog: Observable<boolean> = this.rtcService.showCallDialogObservable;
    public showLiveConf: Observable<boolean> = this.interactionService.showLiveConfObservable;

    private canEnterCall: Observable<boolean> = this.callRestrictionService.canEnterCallObservable;

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
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private callRestrictionService: CallRestrictionService,
        private interactionService: InteractionService,
        private rtcService: RtcService,
        private applauseService: ApplauseService
    ) {
        super(componentServiceCollector, translate);
    }

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [CURRENT_LIST_OF_SPEAKERS_FOLLOW],
            fieldset: ``
        };
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
