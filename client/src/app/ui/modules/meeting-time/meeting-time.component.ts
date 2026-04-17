import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { TimeZoneService } from 'src/app/site/services/time-zone.service';

import { PipesModule } from '../../pipes';

@Component({
    selector: `os-meeting-time`,
    templateUrl: `./meeting-time.component.html`,
    styleUrls: [`./meeting-time.component.scss`],
    imports: [CommonModule, PipesModule]
})
export class MeetingTimeComponent {
    public constructor(public timeZoneService: TimeZoneService) {}

    @Input()
    public meeting?: ViewMeeting;

    @Input()
    public startTime?: string | number;

    @Input()
    public endTime?: string | number;

    @Input()
    public cssClass: string | string[] = [];
}
