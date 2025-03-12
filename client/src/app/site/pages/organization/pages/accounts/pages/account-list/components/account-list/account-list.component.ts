import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { getOmlVerboseName, OML } from 'src/app/domain/definitions/organization-permission';
import { OMLMapping } from 'src/app/domain/definitions/organization-permission';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';

import { AccountExportService } from '../../../../services/account-export.service/account-export.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';
import { AccountFilterService } from '../../../../services/common/account-filter.service';
import { AccountListSearchService } from '../../services/account-list-search/account-list-search.service';
import { AccountSortService } from '../../services/account-list-sort.service/account-sort.service';
import { AccountMergeDialogComponent } from '../account-merge-dialog/account-merge-dialog.component';

const ACCOUNT_LIST_STORAGE_INDEX = `account_list`;

@Component({
    selector: `os-account-list`,
    templateUrl: `./account-list.component.html`,
    styleUrls: [`./account-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountListComponent extends BaseListViewComponent<ViewUser> {
    public meeting: Observable<ViewMeeting> = null;

    public get isMobile(): boolean {
        return this.vp.isMobile;
    }

    public get isUserManager(): boolean {
        return this.operator.hasOrganizationPermissions(OML.can_manage_users);
    }

    public get fakeFilters(): Observable<{ [key: string]: () => void }> {
        if (this.meeting) {
            return this.meeting.pipe(
                map(meeting => {
                    if (meeting) {
                        return { [meeting.name]: () => this.navigateToBaseList() };
                    }
                    return {};
                })
            );
        }
        return null;
    }

    public constructor(
        protected override translate: TranslateService,
        public readonly controller: AccountControllerService,
        public readonly filterService: AccountFilterService,
        public readonly sortService: AccountSortService,
        private route: ActivatedRoute,
        private exporter: AccountExportService,
        private meetingRepo: MeetingControllerService,
        private choiceService: ChoiceService,
        private userController: UserControllerService,
        public searchService: AccountListSearchService,
        private operator: OperatorService,
        private vp: ViewPortService,
        private dialog: MatDialog
    ) {
        super();
        super.setTitle(`Accounts`);
        this.canMultiSelect = true;
        this.listStorageIndex = ACCOUNT_LIST_STORAGE_INDEX;
        this.subscriptions.push(
            this.route.params.subscribe(async params => {
                this.filterService.filterMeeting(params[`meetingId`] || null);
                if (params[`meetingId`]) {
                    this.meeting = this.meetingRepo.getViewModelObservable(+params[`meetingId`]);
                }
            })
        );
    }

    public ariaLabel(user: ViewUser): string {
        return this.translate.instant(`Navigate to account page from `) + user.short_name;
    }

    public createNewMember(): void {
        this.router.navigate([`create`], { relativeTo: this.route });
    }

    public navigateToMember(account: ViewUser): void {
        this.router.navigate([account.id, `edit`], { relativeTo: this.route });
    }

    public navigateToBaseList(): void {
        this.router.navigate([`/accounts`]);
    }

    public async deleteUsers(accounts: ViewUser[] = this.selectedRows): Promise<void> {
        await this.controller.doDeleteOrRemove(accounts);
    }

    public async assignMeetingToUsers(): Promise<void> {
        const title = this.translate.instant(`This will add or remove the selected accounts to following meetings:`);
        const ADD = _(`Add`);
        const REMOVE = _(`Remove`);
        const actions = [ADD, REMOVE];
        const meetings = this.meetingRepo.getViewModelList();
        const result = await this.choiceService.open<ViewMeeting>({
            title,
            choices: this.operator.canSkipPermissionCheck
                ? meetings.filter(meeting => !meeting.locked_from_inside)
                : meetings.filter(meeting => this.operator.isInMeeting(meeting.id) && !meeting.locked_from_inside),
            multiSelect: true,
            actions,
            content: this.translate.instant(
                `Attention: Accounts will add to the default group of each meeting only. If another group is intended please use the 'Add to meetings' dialog in account detail view.`
            )
        });
        if (result) {
            if (!result.items.length) {
                throw new Error(_(`No meeting selected`));
            }
            if (result.action === ADD) {
                this.controller.bulkAddUserToMeeting(this.selectedRows, ...result.items).resolve();
            } else {
                this.controller.bulkRemoveUserFromMeeting(this.selectedRows, ...result.items).then(action => {
                    if (action) {
                        action.resolve();
                    }
                });
            }
        }
    }

    public async changeActiveState(): Promise<void> {
        const title = this.translate.instant(`Set status for selected accounts`);
        const SET_ACTIVE = _(`active`);
        const SET_INACTIVE = _(`inactive`);
        const result = await this.choiceService.open({ title, actions: [SET_ACTIVE, SET_INACTIVE] });
        if (result) {
            const isActive = result.action === SET_ACTIVE;
            this.userController.update({ is_active: isActive }, ...this.selectedRows).resolve();
        }
    }

    public csvExportMemberList(users = this.listComponent.source): void {
        this.exporter.downloadAccountCsvFile(users);
    }

    public getOmlByUser(user: ViewUser): string {
        return getOmlVerboseName(user.organization_management_level as keyof OMLMapping);
    }

    public async mergeUsersTogether(): Promise<void> {
        const result = await this.openMergeDialog();
        if (result) {
            const id = result;
            const user_ids = this.selectedRows.map(view => view.id).filter(sRid => sRid !== id);
            this.controller.mergeTogether([{ id: id, user_ids: user_ids }]).resolve();
        }
    }

    public async openMergeDialog(): Promise<number | null> {
        const data = { choices: this.selectedRows };
        const dialogRef = this.dialog.open(AccountMergeDialogComponent, {
            ...mediumDialogSettings,
            data: data
        });
        return firstValueFrom(dialogRef.afterClosed());
    }
}
