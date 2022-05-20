import { Component } from '@angular/core';

import { ActiveMeetingService } from '../../../../site/pages/meetings/services/active-meeting.service';
import { OrganizationService } from '../../../../site/pages/organization/services/organization.service';

@Component({
    selector: `os-global-headbar`,
    templateUrl: `./global-headbar.component.html`,
    styleUrls: [`./global-headbar.component.scss`]
})
export class GlobalHeadbarComponent {
    public isSearchEnabled = false;

    public get displayName(): string {
        if (this.activeMeeting.meeting) {
            return this.activeMeeting.meeting.name;
        }
        if (this.orgaService.organization) {
            return this.orgaService.organization?.name;
        }
        return ``;
    }

    public constructor(private activeMeeting: ActiveMeetingService, private orgaService: OrganizationService) {}

    public openSearch(): void {}
}
