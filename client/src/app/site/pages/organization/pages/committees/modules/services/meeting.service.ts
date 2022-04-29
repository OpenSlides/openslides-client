import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { AccountFilterService } from '../../../accounts/services/common/account-filter.service';
import { CommitteeComponentsServiceModule } from './committee-components-service.module';

@Injectable({
    providedIn: CommitteeComponentsServiceModule
})
export class MeetingService {
    public constructor(private router: Router, private accountFilterService: AccountFilterService) {}

    public async navigateToMeetingUsers(meeting: ViewMeeting): Promise<void> {
        await this.router.navigate([`accounts`]);
        this.accountFilterService.clearAllFilters();
        this.accountFilterService.toggleFilterOption(`id`, {
            condition: meeting.user_ids,
            label: meeting.name
        });
    }
}
