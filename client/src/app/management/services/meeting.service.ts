import { Router } from '@angular/router';
import { MemberFilterService } from './member-filter.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MeetingService {
    public constructor(private router: Router, private memberFilterService: MemberFilterService) {}

    public async navigateToMeetingUsers(meeting: ViewMeeting): Promise<void> {
        await this.router.navigate(['members']);
        this.memberFilterService.clearAllFilters();
        this.memberFilterService.toggleFilterOption('id', {
            condition: meeting.user_ids,
            label: meeting.name
        });
    }
}
