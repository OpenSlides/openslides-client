import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { OsSortingDefinition, OsSortingOption } from 'app/core/ui-services/base-sort.service';
import { BaseSortListService } from 'app/core/ui-services/base-sort-list.service';

import { ViewCommittee } from '../models/view-committee';

@Injectable({
    providedIn: `root`
})
export class CommitteeSortService extends BaseSortListService<ViewCommittee> {
    protected storageKey = `CommitteeList`;

    private readonly staticSortOptions: OsSortingOption<ViewCommittee>[] = [
        { property: `name`, label: this.translate.instant(`Title`) },
        { property: `meetingAmount`, label: this.translate.instant(`Amount of meetings`) },
        { property: `memberAmount`, label: this.translate.instant(`Amount of accounts`) }
    ];

    public constructor(protected translate: TranslateService, store: StorageService, historyService: HistoryService) {
        super(translate, store, historyService);
    }

    protected getSortOptions(): OsSortingOption<ViewCommittee>[] {
        return this.staticSortOptions;
    }

    protected getDefaultDefinition(): OsSortingDefinition<ViewCommittee> {
        return {
            sortProperty: `name`,
            sortAscending: true
        };
    }
}
