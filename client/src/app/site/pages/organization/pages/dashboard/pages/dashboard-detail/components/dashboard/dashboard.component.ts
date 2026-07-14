import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { RelatedTime, ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ThemeService } from 'src/app/site/services/theme.service';

import { DASHBOARD_MEETING_LIST_SUBSCRIPTION } from '../../../../dashboard.subscription';

@Component({
    selector: `os-dashboard`,
    templateUrl: `./dashboard.component.html`,
    styleUrls: [`./dashboard.component.scss`],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class DashboardComponent extends BaseComponent {
    public get noMeetingsToShow(): boolean {
        return (
            !this.previousMeetings?.length &&
            !this.currentMeetings.length &&
            !this.futureMeetings.length &&
            !this.noDateMeetings.length
        );
    }

    public get noNoDateMeetingsToShow(): boolean {
        return !this.noDateMeetings.length;
    }

    public get isDarkModeObservable(): Observable<boolean> {
        return this.themeService.isDarkModeObservable;
    }

    public get organizationDescription(): string {
        return this.orgaService.organization?.description;
    }

    public ready = false;

    public previousMeetings: ViewMeeting[] = [];
    public currentMeetings: ViewMeeting[] = [];
    public futureMeetings: ViewMeeting[] = [];
    public noDateMeetings: ViewMeeting[] = [];

    public operator = inject(OperatorService);
    private orgaService = inject(OrganizationService);
    private meetingRepo = inject(MeetingControllerService);
    private themeService = inject(ThemeService);

    public constructor() {
        super();
        super.setTitle(`Calendar`);
        this.loadMeetings();

        this.modelRequestService
            .waitSubscriptionReady(DASHBOARD_MEETING_LIST_SUBSCRIPTION)
            .then(() => {
                this.ready = true;
            })
            .catch(e => {
                console.error(e);
                this.ready = true;
            });
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
        this.subscriptions.push(
            this.meetingRepo.getViewModelListObservable().subscribe(meetings => {
                const filteredMeetings = meetings.filter(
                    meeting =>
                        this.operator.isInMeeting(meeting.id) ||
                        this.operator.canSkipPermissionCheck ||
                        (meeting.publicAccessPossible() && this.operator.isAnonymous) ||
                        this.operator.isCommitteeManagerForMeeting(meeting.id)
                );
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                this.noDateMeetings = filteredMeetings.filter(meeting => meeting.relatedTime === RelatedTime.Dateless);
                this.previousMeetings = filteredMeetings
                    .filter(meeting => meeting.relatedTime === RelatedTime.Past)
                    .sort((a, b) => this.sortMeeting(a, b))
                    .reverse();
                this.futureMeetings = filteredMeetings
                    .filter(meeting => meeting.relatedTime === RelatedTime.Future)
                    .sort((a, b) => this.sortMeeting(a, b));
                this.currentMeetings = filteredMeetings
                    .filter(meeting => meeting.relatedTime === RelatedTime.Current)
                    .sort((a, b) => this.sortMeeting(a, b));
            })
        );
    }

    private sortMeeting(a: ViewMeeting, b: ViewMeeting): number {
        if (a.start_time !== b.start_time) {
            return a.start_time - b.start_time;
        }
        return a.end_time - b.end_time;
    }
}
