import { Component } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';

import { GlobalHeadbarService } from '../../global-headbar.service';
import { GlobalSearchComponent } from '../global-search/global-search.component';

@Component({
    selector: `os-global-headbar`,
    templateUrl: `./global-headbar.component.html`,
    styleUrls: [`./global-headbar.component.scss`]
})
export class GlobalHeadbarComponent {
    public isSearchEnabled = true;

    public get displayName(): string {
        if (this.activeMeeting.meeting) {
            return this.activeMeeting.meeting.name;
        }
        if (this.orgaService.organization) {
            return this.orgaService.organization?.name;
        }
        return ``;
    }

    public constructor(
        private activeMeeting: ActiveMeetingService,
        private orgaService: OrganizationService,
        private dialog: MatDialog,
        public headbarService: GlobalHeadbarService
    ) {}

    public openSearch(): void {
        this.dialog.open(GlobalSearchComponent, {
            position: {
                top: `5vh`
            }
        });
    }
}
