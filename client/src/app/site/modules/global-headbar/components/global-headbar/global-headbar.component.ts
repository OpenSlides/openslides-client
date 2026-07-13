import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { GlobalHeadbarService } from '../../global-headbar.service';
import { GlobalSearchComponent } from '../global-search/global-search.component';

@Component({
    selector: `os-global-headbar`,
    templateUrl: `./global-headbar.component.html`,
    styleUrls: [`./global-headbar.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GlobalHeadbarComponent {
    public isSearchEnabled = true;

    public get committeeLink(): string {
        return `/committees/` + this.activeMeeting?.meeting?.committee_id;
    }

    public get displayName(): string {
        if (this.activeMeeting.meeting) {
            return this.activeMeeting.meeting.name;
        }
        if (this.orgaService.organization) {
            return this.orgaService.organization?.name;
        }
        return ``;
    }

    public get showCommitteeLink(): boolean {
        if (
            this.activeMeeting.meeting &&
            (this.operatorService.canSkipPermissionCheck || this.operatorService.knowsMultipleMeetings)
        ) {
            return true;
        }
        return false;
    }

    private operatorService = inject(OperatorService);
    private activeMeeting = inject(ActiveMeetingService);
    private orgaService = inject(OrganizationService);
    private dialog = inject(MatDialog);
    public headbarService = inject(GlobalHeadbarService);

    public openSearch(): void {
        this.dialog.open(GlobalSearchComponent, {
            autoFocus: false,
            restoreFocus: true,
            position: {
                top: `5vh`
            }
        });
    }

    public get showLongpollingIcon(): boolean {
        return this.headbarService.longpolling;
    }
}
