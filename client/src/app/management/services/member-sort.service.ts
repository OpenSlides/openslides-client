import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { OsSortingDefinition, OsSortingOption } from 'app/core/ui-services/base-sort.service';
import { BaseSortListService } from 'app/core/ui-services/base-sort-list.service';
import { ViewUser } from 'app/site/users/models/view-user';

@Injectable({
    providedIn: `root`
})
export class MemberSortService extends BaseSortListService<ViewUser> {
    protected storageKey = `MemberList`;

    private staticSortOptions: OsSortingOption<ViewUser>[] = [
        { property: `first_name`, label: `Given name` },
        { property: `last_name`, label: `Surname` },
        { property: `is_active`, label: `Is active` },
        { property: `default_number`, label: `Participant number` },
        { property: `default_structure_level`, label: `Structure level` },
        { property: `default_vote_weight`, label: `Vote weight` },
        { property: `gender`, label: `Gender` }
    ];

    public constructor(translate: TranslateService, history: HistoryService, store: StorageService) {
        super(translate, store, history);
    }

    protected getSortOptions(): OsSortingOption<ViewUser>[] {
        return this.staticSortOptions;
    }
    protected async getDefaultDefinition(): Promise<OsSortingDefinition<ViewUser>> {
        return {
            sortProperty: `first_name`,
            sortAscending: true
        };
    }
}
