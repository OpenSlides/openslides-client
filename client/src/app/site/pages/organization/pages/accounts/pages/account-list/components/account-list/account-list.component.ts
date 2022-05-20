import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { getOmlVerboseName } from 'src/app/domain/definitions/organization-permission';
import { OMLMapping } from 'src/app/domain/definitions/organization-permission';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';

import { AccountExportService } from '../../../../services/account-export.service/account-export.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';
import { AccountFilterService } from '../../../../services/common/account-filter.service';
import { AccountSortService } from '../../services/account-list-sort.service/account-sort.service';

@Component({
    selector: `os-account-list`,
    templateUrl: `./account-list.component.html`,
    styleUrls: [`./account-list.component.scss`]
})
export class AccountListComponent extends BaseListViewComponent<ViewUser> implements OnInit {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `short_name`,
            width: `50%`
        },
        {
            prop: `info`,
            width: `50%`
        },
        {
            prop: `is_active`,
            width: `100px`
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public readonly controller: AccountControllerService,
        public readonly filterService: AccountFilterService,
        public readonly sortService: AccountSortService,
        private route: ActivatedRoute,
        private exporter: AccountExportService,
        private meetingRepo: MeetingControllerService,
        private choiceService: ChoiceService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Accounts`);
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        this.loadUsers();
    }

    public createNewMember(): void {
        this.router.navigate([`create`], { relativeTo: this.route });
    }

    public navigateToMember(account: ViewUser): void {
        this.router.navigate([account.id, `edit`], { relativeTo: this.route });
    }

    public async deleteSelected(accounts: ViewUser[] = this.selectedRows): Promise<void> {
        await this.controller.doDeleteOrRemove(accounts);
    }

    public async assignMeetingToUsers(): Promise<void> {
        const content = this.translate.instant(
            `This will add or remove the selected accounts to the following meeting:`
        );
        const ADD = _(`Add`);
        const REMOVE = _(`Remove`);
        const choices = [ADD, REMOVE];
        const meetingList = this.meetingRepo.getViewModelList();
        const selectedChoice = await this.choiceService.open(content, meetingList, false, choices);
        if (selectedChoice) {
            /**
             * TODO: would be nice if the couce service could return the
             * selected view models and not just the numbers
             */
            const selectedMeeting = meetingList.find(meeting => {
                return (selectedChoice.items as number) === meeting.id;
            });
            if (!selectedMeeting) {
                throw new Error(`Wrong meeting selected`);
            }
            if (selectedChoice.action === ADD) {
                this.controller.bulkAddUserToMeeting(this.selectedRows, selectedMeeting);
            } else {
                this.controller.bulkRemoveUserFromMeeting(this.selectedRows, selectedMeeting).resolve();
            }
        }
    }

    public csvExportMemberList(): void {
        this.exporter.downloadAccountCsvFile(this.dataSource!.filteredData);
    }

    public getOmlByUser(user: ViewUser): string {
        return getOmlVerboseName(user.organization_management_level as keyof OMLMapping);
    }

    private async loadUsers(start_index: number = 0, entries: number = 500): Promise<void> {}
}
