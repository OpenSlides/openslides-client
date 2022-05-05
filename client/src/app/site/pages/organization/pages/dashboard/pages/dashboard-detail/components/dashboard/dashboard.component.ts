import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ThemeService } from 'src/app/site/services/theme.service';
import { BaseComponent } from 'src/app/site/base/base.component';

@Component({
    selector: 'os-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
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

    public get isDarkModeObservable(): Observable<boolean> {
        return this.themeService.isDarkModeObservable;
    }

    public previousMeetings: ViewMeeting[] = [];
    public currentMeetings: ViewMeeting[] = [];
    public futureMeetings: ViewMeeting[] = [];
    public noDateMeetings: ViewMeeting[] = [];

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        private meetingRepo: MeetingControllerService,
        private themeService: ThemeService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Calendar`);
        this.loadMeetings();
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
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                this.noDateMeetings = meetings.filter(meeting => !meeting.start_time && !meeting.end_time);
                this.previousMeetings = meetings
                    .filter(meeting => (meeting.endDate as Date) < currentDate)
                    .sort((a, b) => b.end_time - a.end_time);
                this.futureMeetings = meetings
                    .filter(meeting => (meeting.startDate as Date) > currentDate)
                    .sort((a, b) => a.end_time - b.end_time);
                this.currentMeetings = meetings.filter(
                    meeting => (meeting.endDate as Date) >= currentDate && (meeting.startDate as Date) <= currentDate
                );
            })
        );
    }
}
