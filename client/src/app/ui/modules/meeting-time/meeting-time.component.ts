import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { PipesModule } from '../../pipes';

@Component({
    selector: `os-meeting-time`,
    templateUrl: `./meeting-time.component.html`,
    styleUrls: [`./meeting-time.component.scss`],
    standalone: true,
    imports: [CommonModule, PipesModule]
})
export class MeetingTimeComponent {
    @Input()
    public meeting?: ViewMeeting;

    @Input()
    public startTime?: string | number;

    @Input()
    public endTime?: string | number;

    @Input()
    public cssClass: string | string[] = [];
}
