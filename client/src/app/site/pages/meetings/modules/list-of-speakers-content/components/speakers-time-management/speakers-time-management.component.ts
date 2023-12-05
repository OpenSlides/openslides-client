import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { DurationService } from 'src/app/site/services/duration.service';

@Component({
    selector: `os-speakers-time-management`,
    templateUrl: `./speakers-time-management.component.html`,
    styleUrls: [`./speakers-time-management.component.scss`]
})
export class SpeakersTimeManagementComponent extends BaseMeetingComponent {
    public myDataSource = [
        { structure_level: `SPD`, total_time: 120, overhang_time: 0, color: `#ee0000` },
        { structure_level: `Vorstand`, total_time: 180, overhang_time: 0, color: `#000000` },
        { structure_level: `Grüne`, total_time: 120, overhang_time: 0, color: `#00ff00` }
    ];

    public displayedColumns = [`structure_level`, `total_time`, `overhang_time`];
    public enableProContraSpeech = false;
    public speakerTimeManagementEdit = false;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private durationService: DurationService
    ) {
        super(componentServiceCollector, translate);
    }

    public toggleEdit(): void {
        this.speakerTimeManagementEdit = !this.speakerTimeManagementEdit;
    }

    public duration(value: number): string {
        return this.durationService.durationToString(value, `m`).slice(0, -2);
    }
}
