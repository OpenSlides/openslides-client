import { Component, Input } from '@angular/core';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

@Component({
    selector: `os-meeting-time`,
    templateUrl: `./meeting-time.component.html`,
    styleUrls: [`./meeting-time.component.scss`]
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
