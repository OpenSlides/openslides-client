import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { getAssignmentSubscriptionConfig } from '../../config/model-subscription';
import { getAgendaSubscriptionConfig } from '../../../agenda/config/model-subscription';

const ASSIGNMENT_SUBSCRIPTION = `assignment`;

@Component({
    selector: 'os-assignment-main',
    templateUrl: './assignment-main.component.html',
    styleUrls: ['./assignment-main.component.scss']
})
export class AssignmentMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.updateSubscribeTo(
                getAssignmentSubscriptionConfig(id, () => this.getNextMeetingIdObservable()),
                getAgendaSubscriptionConfig(id, () => this.getNextMeetingIdObservable())
            );
        }
    }
}
