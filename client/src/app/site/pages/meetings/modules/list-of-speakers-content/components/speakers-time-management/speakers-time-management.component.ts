import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
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
        { id: `1`, structure_level: `SPD`, total_time: 120, overhang_time: 0, color: `#ee0000` },
        { id: `3`, structure_level: `Vorstand`, total_time: 180, overhang_time: 0, color: `#000000` },
        { id: `5`, structure_level: `Die Grünen`, total_time: 120, overhang_time: 0, color: `#00ff00` }
    ];

    public displayedColumns = [`structure_level`, `total_time`, `overhang_time`];
    public enableProContraSpeech = false;
    public timeEdit = false;
    public timeTestFormControls = { '1': new FormControl(``), '3': new FormControl(``), '5': new FormControl(``) };

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private durationService: DurationService
    ) {
        super(componentServiceCollector, translate);
    }

    public toggleEdit(): void {
        this.timeEdit = !this.timeEdit;
        if (this.timeEdit) {
            this.setFormControls();
        }
    }

    public duration(value: number): string {
        return this.durationService.durationToString(value, `m`).slice(0, -2);
    }

    public saveTimes(): void {
        for (const entry of this.myDataSource) {
            entry.total_time = this.timeTestFormControls[entry.id].getRawValue();
        }
        this.timeEdit = false;
    }

    private setFormControls(): void {
        for (const entry of this.myDataSource) {
            const id = entry.id;
            this.timeTestFormControls[id].setValue(entry[`total_time`]);
        }
    }
}
