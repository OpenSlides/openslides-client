import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { OrganizationRepositoryService } from 'app/core/repositories/management/organization-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOrganization } from 'app/management/models/view-organization';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { Observable } from 'rxjs';

import { ThemeService } from '../../../core/ui-services/theme.service';

@Component({
    selector: `os-dashboard`,
    templateUrl: `./dashboard.component.html`,
    styleUrls: [`./dashboard.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent extends BaseModelContextComponent implements OnInit {
    public get noMeetingsToShow(): boolean {
        return (
            !this.previousMeetings?.length &&
            !this.currentMeetings.length &&
            !this.futureMeetings.length &&
            !this.noDateMeetings.length
        );
    }

    public get orgaName(): string {
        return this.organization?.name || ``;
    }

    public get orgaDescription(): string {
        return this.organization?.description || ``;
    }

    public get isPhone(): boolean {
        return this.vp.isMobile;
    }

    public get isDarkModeObservable(): Observable<boolean> {
        return this.themeService.isDarkModeObservable;
    }

    public previousMeetings: ViewMeeting[] = [];
    public currentMeetings: ViewMeeting[] = [];
    public futureMeetings: ViewMeeting[] = [];
    public noDateMeetings: ViewMeeting[] = [];

    private organization: ViewOrganization | undefined = undefined; // not initialized

    public constructor(
        protected componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private organizationRepo: OrganizationRepositoryService,
        private meetingRepo: MeetingRepositoryService,
        private operator: OperatorService,
        private vp: ViewportService,
        private themeService: ThemeService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Calendar`);
        this.loadMeetings();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.organizationRepo.getViewModelObservable(ORGANIZATION_ID).subscribe(organization => {
                this.organization = organization;
            })
        );
    }

    public getHeightByMeetings(meetings: ViewMeeting[]): string {
        let height = 0;
        if (meetings.length === 0) {
            return ``;
        } else if (meetings.length > 3) {
            height = 240;
        } else {
            height = meetings.length * 60;
        }
        return `${height}px`;
    }

    private loadMeetings(): void {
        this.requestModels(
            {
                viewModelCtor: ViewOrganization,
                ids: [1],
                follow: [
                    {
                        idField: `committee_ids`,
                        follow: [{ idField: `meeting_ids`, fieldset: `dashboard` }]
                    }
                ],
                fieldset: []
            },
            `loadAllMeetings`
        );

        this.requestModels(
            {
                viewModelCtor: ViewUser,
                ids: [this.operator.operatorId],
                follow: [
                    {
                        idField: `is_present_in_meeting_ids`
                    }
                ],
                fieldset: `orgaList`
            },
            `loadOperatorMeetings`
        );

        this.subscriptions.push(
            this.meetingRepo.getViewModelListObservable().subscribe(meetings => {
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                this.noDateMeetings = meetings.filter(meeting => !meeting.start_time && !meeting.end_time);
                this.previousMeetings = meetings
                    .filter(meeting => meeting.endDate < currentDate)
                    .sort((a, b) => b.end_time - a.end_time);
                this.futureMeetings = meetings
                    .filter(meeting => meeting.startDate > currentDate)
                    .sort((a, b) => a.end_time - b.end_time);
                this.currentMeetings = meetings.filter(
                    meeting => meeting.endDate >= currentDate && meeting.startDate <= currentDate
                );
            })
        );
    }
}
