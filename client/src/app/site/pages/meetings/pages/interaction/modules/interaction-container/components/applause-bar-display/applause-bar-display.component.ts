import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { BaseMeetingComponent } from '@app/site/pages/meetings/base/base-meeting.component';

import { ApplauseService } from '../../../../services/applause.service';

@Component({
    selector: `os-applause-bar-display`,
    templateUrl: `./applause-bar-display.component.html`,
    styleUrls: [`./applause-bar-display.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ApplauseBarDisplayComponent extends BaseMeetingComponent {
    public percent = 0;

    private level = 0;

    private cd = inject(ChangeDetectorRef);
    private applauseService = inject(ApplauseService);

    public constructor() {
        super();
        this.subscriptions.push(
            this.applauseService.applauseLevelObservable.subscribe(applauseLevel => {
                this.level = applauseLevel || 0;
                this.percent = this.applauseService.getApplauseQuote(this.level) * 100;
                this.cd.markForCheck();
            }),
            this.meetingSettingsService.get(`applause_type`).subscribe(() => {
                this.cd.markForCheck();
            })
        );
    }
}
