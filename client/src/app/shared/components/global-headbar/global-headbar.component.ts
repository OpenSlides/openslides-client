import { Component } from '@angular/core';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { OrganizationService } from 'app/core/core-services/organization.service';
import { ThemeService } from '../../../core/ui-services/theme.service';

@Component({
    selector: 'os-global-headbar',
    templateUrl: './global-headbar.component.html',
    styleUrls: ['./global-headbar.component.scss']
})
export class GlobalHeadbarComponent {
    public isSearchEnabled = false;

    public get displayName(): string {
        return this.activeMeeting.meeting?.name || this.orgaService.organization?.name;
    }

    public constructor(
        private activeMeeting: ActiveMeetingService,
        private orgaService: OrganizationService,
        private themeService: ThemeService
    ) {}
}
