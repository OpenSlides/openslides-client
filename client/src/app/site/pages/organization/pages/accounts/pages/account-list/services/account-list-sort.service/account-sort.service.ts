import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingDefinition, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { AccountListServiceModule } from '../account-list-service.module';

@Injectable({
    providedIn: AccountListServiceModule
})
export class AccountSortService extends BaseSortListService<ViewUser> {
    protected storageKey = `MemberList`;

    private staticSortOptions: OsSortingOption<ViewUser>[] = [
        { property: `full_name`, label: `Full name` },
        { property: [`first_name`, `last_name`], label: `Given name` },
        { property: [`last_name`, `first_name`], label: `Surname` },
        { property: `is_active`, label: `Is active` },
        { property: `default_number`, label: `Participant number` },
        { property: `default_structure_level`, label: `Structure level` },
        { property: `default_vote_weight`, label: `Vote weight` },
        { property: `gender`, label: `Gender` }
    ];

    public constructor(translate: TranslateService, store: StorageService) {
        super(translate, store);
    }

    protected getSortOptions(): OsSortingOption<ViewUser>[] {
        return this.staticSortOptions;
    }
    protected async getDefaultDefinition(): Promise<OsSortingDefinition<ViewUser>> {
        return {
            sortProperty: [`first_name`, `last_name`],
            sortAscending: true
        };
    }
}
