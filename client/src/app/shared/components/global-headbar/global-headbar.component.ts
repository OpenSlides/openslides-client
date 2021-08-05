import { Component, OnInit } from '@angular/core';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { OrganizationService } from 'app/core/core-services/organization.service';

@Component({
    selector: 'os-global-headbar',
    templateUrl: './global-headbar.component.html',
    styleUrls: ['./global-headbar.component.scss']
})
export class GlobalHeadbarComponent implements OnInit {
    public isSearchEnabled = false;

    public get displayName(): string {
        return this.activeMeeting.meeting?.name || this.orgaService.organization?.name;
    }

    public constructor(private activeMeeting: ActiveMeetingService, private orgaService: OrganizationService) {}

    public ngOnInit(): void {}
}
