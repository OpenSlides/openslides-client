import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ViewMeeting } from 'app/management/models/view-meeting';

import { MemberFilterService } from './member-filter.service';

@Injectable({ providedIn: `root` })
export class MeetingService {
    public constructor(private router: Router, private memberFilterService: MemberFilterService) {}

    public async navigateToMeetingUsers(meeting: ViewMeeting): Promise<void> {
        await this.router.navigate([`accounts`]);
        this.memberFilterService.clearAllFilters();
        this.memberFilterService.toggleFilterOption(`id`, {
            condition: meeting.user_ids,
            label: meeting.name
        });
    }
}
