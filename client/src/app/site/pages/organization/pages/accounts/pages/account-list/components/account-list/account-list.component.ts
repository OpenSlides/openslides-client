import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { getOmlVerboseName } from 'src/app/domain/definitions/organization-permission';
import { OMLMapping } from 'src/app/domain/definitions/organization-permission';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
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
export class AccountListComponent extends BaseListViewComponent<ViewUser> {
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
        const title = this.translate.instant(`This will add or remove the selected accounts to the following meeting:`);
        const ADD = _(`Add`);
        const REMOVE = _(`Remove`);
        const actions = [ADD, REMOVE];
        const result = await this.choiceService.open<ViewMeeting>({
            title,
            choices: this.meetingRepo.getViewModelList(),
            multiSelect: true,
            actions
        });
        if (result) {
            if (!result.items.length) {
                throw new Error(_(`No meeting selected`));
            }
            if (result.action === ADD) {
                this.controller.bulkAddUserToMeeting(this.selectedRows, ...result.items).resolve();
            } else {
                this.controller.bulkRemoveUserFromMeeting(this.selectedRows, ...result.items).resolve();
            }
        }
    }

    public async changeActiveState(): Promise<void> {}

    public csvExportMemberList(): void {
        this.exporter.downloadAccountCsvFile(this.listComponent.source);
    }

    public getOmlByUser(user: ViewUser): string {
        return getOmlVerboseName(user.organization_management_level as keyof OMLMapping);
    }
}
