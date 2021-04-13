import { Component, OnInit } from '@angular/core';

import { MeetingRepositoryService } from 'app/core/repositories/event-management/meeting-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewOrganisation } from 'app/site/event-management/models/view-organisation';

@Component({
    selector: 'os-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseModelContextComponent implements OnInit {
    public get noMeetingsToShow(): boolean {
        return !this.previousMeetings?.length && !this.currentMeetings.length && !this.futureMeetings.length;
    }

    public previousMeetings: ViewMeeting[];
    public currentMeetings: ViewMeeting[];
    public futureMeetings: ViewMeeting[];
    public constructor(
        protected componentServiceCollector: ComponentServiceCollector,
        private meetingRepo: MeetingRepositoryService
    ) {
        super(componentServiceCollector);
        super.setTitle('Dashboard');
        this.getMeetings();
    }

    public ngOnInit(): void {}

    private getMeetings(): void {
        this.requestModels({
            viewModelCtor: ViewOrganisation,
            ids: [1],
            follow: [
                {
                    idField: 'committee_ids',
                    follow: [{ idField: 'meeting_ids', fieldset: 'dashboard' }]
                }
            ],
            fieldset: []
        });

        this.meetingRepo.getViewModelListObservable().subscribe(meetings => {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            this.previousMeetings = meetings
                .filter(meeting => meeting.endDate < currentDate)
                .sort((a, b) => b.end_time - a.end_time);
            this.futureMeetings = meetings
                .filter(meeting => meeting.startDate > currentDate)
                .sort((a, b) => a.end_time - b.end_time);
            this.currentMeetings = meetings.filter(
                meeting => meeting.endDate >= currentDate && meeting.startDate <= currentDate
            );
        });
    }
}
