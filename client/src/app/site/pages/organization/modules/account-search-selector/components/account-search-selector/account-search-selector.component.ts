import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, OnInit } from '@angular/core';
import { NgControl, UntypedFormBuilder } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import {
    SearchUsersByNameOrEmailPresenterScope,
    SearchUsersByNameOrEmailPresenterService
} from 'src/app/gateways/presenter';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseSearchSelectorComponent } from 'src/app/ui/modules/search-selector/components/base-search-selector/base-search-selector.component';

@Component({
    selector: `os-account-search-selector`,
    templateUrl: `../../../../../../../ui/modules/search-selector/components/base-search-selector/base-search-selector.component.html`,
    styleUrls: [
        `./account-search-selector.component.scss`,
        `../../../../../../../ui/modules/search-selector/components/base-search-selector/base-search-selector.component.scss`
    ],
    providers: [{ provide: MatFormFieldControl, useExisting: AccountSearchSelectorComponent }]
})
export class AccountSearchSelectorComponent extends BaseSearchSelectorComponent implements OnInit {
    public readonly controlType = `account-search-selector`;

    public override readonly multiple = true;

    public constructor(
        fb: UntypedFormBuilder,
        fm: FocusMonitor,
        element: ElementRef,
        ngControl: NgControl,
        private userController: UserControllerService,
        private operator: OperatorService,
        private presenter: SearchUsersByNameOrEmailPresenterService
    ) {
        super(fb, fm, element, ngControl);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.selectableItems = [this.userController.getViewModel(this.operator.operatorId!)!];
    }

    public override onSelectionChange(value: Selectable, change: MatOptionSelectionChange<any>): void {
        super.onSelectionChange(value, change);
        this.addSelectableItem(value);
    }

    protected override onSearchValueUpdated(nextValue: string): void {
        if (nextValue.length >= 3) {
            this.searchAccount(nextValue);
        }
    }

    private async searchAccount(name: string): Promise<void> {
        const user = this.userController.parseStringIntoUser(name);
        const result = await this.presenter.call({
            searchCriteria: [{ username: user.username }],
            permissionRelatedId: ORGANIZATION_ID,
            permissionScope: SearchUsersByNameOrEmailPresenterScope.ORGANIZATION
        });
        const nextValue = Object.values(result).flat();
        const getTitle = (user: { first_name: string; last_name: string }) => `${user.first_name} ${user.last_name}`;
        this.filteredItemsSubject.next(
            nextValue.map(entry => ({
                id: entry.id,
                getTitle: () => getTitle(entry),
                getListTitle: () => getTitle(entry)
            }))
        );
    }
}
