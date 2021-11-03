import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { fadeInAnim } from 'app/shared/animations';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ApplauseService } from 'app/site/interaction/services/applause.service';

@Component({
    selector: `os-applause-bar-display`,
    templateUrl: `./applause-bar-display.component.html`,
    styleUrls: [`./applause-bar-display.component.scss`],
    animations: [fadeInAnim],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ApplauseBarDisplayComponent extends BaseComponent {
    public percent = 0;

    private level = 0;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        cd: ChangeDetectorRef,
        private applauseService: ApplauseService,
        settingService: MeetingSettingsService
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(
            applauseService.applauseLevelObservable.subscribe(applauseLevel => {
                this.level = applauseLevel || 0;
                this.percent = this.applauseService.getApplauseQuote(this.level) * 100;
                cd.markForCheck();
            }),
            settingService.get(`applause_type`).subscribe(() => {
                cd.markForCheck();
            })
        );
    }
}
