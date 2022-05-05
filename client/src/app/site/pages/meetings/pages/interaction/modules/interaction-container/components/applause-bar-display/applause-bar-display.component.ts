import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { fadeInAnim } from 'src/app/infrastructure/animations';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ApplauseService } from '../../../../services/applause.service';
import { TranslateService } from '@ngx-translate/core';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';

@Component({
    selector: 'os-applause-bar-display',
    templateUrl: './applause-bar-display.component.html',
    styleUrls: ['./applause-bar-display.component.scss'],
    animations: [fadeInAnim],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ApplauseBarDisplayComponent extends BaseMeetingComponent {
    public percent = 0;

    private level = 0;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        translate: TranslateService,
        cd: ChangeDetectorRef,
        private applauseService: ApplauseService
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(
            applauseService.applauseLevelObservable.subscribe(applauseLevel => {
                this.level = applauseLevel || 0;
                this.percent = this.applauseService.getApplauseQuote(this.level) * 100;
                cd.markForCheck();
            }),
            this.meetingSettingsService.get(`applause_type`).subscribe(() => {
                cd.markForCheck();
            })
        );
    }
}
