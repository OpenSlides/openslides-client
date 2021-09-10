import { Component, Input } from '@angular/core';
import { ViewMeeting } from '../../../management/models/view-meeting';

@Component({
    selector: 'os-meeting-time',
    templateUrl: './meeting-time.component.html'
})
export class MeetingTimeComponent {
    @Input()
    public meeting: ViewMeeting;
}
