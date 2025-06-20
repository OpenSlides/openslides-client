import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { distinctUntilChanged } from 'rxjs';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { User } from 'src/app/domain/models/users/user';
import { SearchUsersPresenterService } from 'src/app/gateways/presenter';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserScope } from 'src/app/site/services/user.service';
import { BaseSearchSelectorComponent } from 'src/app/ui/modules/search-selector/components/base-search-selector/base-search-selector.component';

import { AccountSortService } from '../../../../pages/accounts/pages/account-list/services/account-list-sort.service/account-sort.service';

@Component({
    selector: `os-account-search-selector`,
    templateUrl: `../../../../../../../ui/modules/search-selector/components/base-search-selector/base-search-selector.component.html`,
    styleUrls: [
        `./account-search-selector.component.scss`,
        `../../../../../../../ui/modules/search-selector/components/base-search-selector/base-search-selector.component.scss`
    ],
    providers: [{ provide: MatFormFieldControl, useExisting: AccountSearchSelectorComponent }],
    standalone: false
})
export class AccountSearchSelectorComponent extends BaseSearchSelectorComponent implements OnInit, OnDestroy {
    @Input()
    public set accounts(users: ViewUser[]) {
        if (!this.selectableItems?.length) {
            this.selectableItems = [...users];
        } else {
            for (const user of users) {
                this.addSelectableItem(user);
            }
        }
    }

    @Input()
    public committeeId: number = undefined;

    public readonly controlType = `account-search-selector`;

    public override readonly multiple = true;

    public constructor(
        ngControl: NgControl,
        private operator: OperatorService,
        private presenter: SearchUsersPresenterService,
        private userRepo: UserRepositoryService,
        private userSortService: AccountSortService
    ) {
        super(ngControl);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.userSortService.initSorting();
        if (this.operator.hasOrganizationPermissions(OML.can_manage_users) || (this.committeeId && this.operator.hasCommitteePermissions(this.committeeId, CML.can_manage))) {
            this.initItems();
        }
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.userSortService.exitSortService();
    }

    public override onSelectionChange(value: Selectable, change: MatOptionSelectionChange<any>): void {
        super.onSelectionChange(value, change);
        if (!this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            this.addSelectableItem(value);
        }
    }

    protected override onSearchValueUpdated(nextValue: string): void {
        if (this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            super.onSearchValueUpdated(nextValue);
        } else {
            this.searchAccount(nextValue);
        }
    }

    private initItems(): void {
        const observer = this.userRepo.getSortedViewModelListObservable(this.userSortService.repositorySortingKey);
        this.subscriptions.push(
            observer.pipe(distinctUntilChanged((c, o) => c.length === o.length)).subscribe(items => {
                this.selectableItems = items || [];
            })
        );
    }

    private async searchAccount(username: string): Promise<void> {
        if (this.operator.hasOrganizationPermissions(OML.can_manage_users) && username.length >= 3) {
            const result = await this.presenter.call({
                searchCriteria: [{ username }],
                permissionRelatedId: ORGANIZATION_ID,
                permissionScope: UserScope.ORGANIZATION
            })[0];
            const getTitle = (user: Partial<User>): string => `${user.first_name ?? ``} ${user.last_name ?? ``}`;
            this.filteredItemsSubject.next(
                result.map(entry => ({
                    id: entry.id,
                    getTitle: (): string => getTitle(entry),
                    getListTitle: (): string => getTitle(entry)
                }))
            );
        } else {
            super.onSearchValueUpdated(username);
        }
    }
}
