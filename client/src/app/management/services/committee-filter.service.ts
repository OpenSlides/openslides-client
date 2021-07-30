import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { OrganizationTagRepositoryService } from 'app/core/repositories/management/organization-tag-repository.service';
import { BaseFilterListService, OsFilter } from 'app/core/ui-services/base-filter-list.service';
import { ViewCommittee } from '../models/view-committee';

@Injectable({
    providedIn: 'root'
})
export class CommitteeFilterService extends BaseFilterListService<ViewCommittee> {
    protected storageKey = 'CommitteeList';

    private orgaTagFilterOptions: OsFilter<ViewCommittee> = {
        property: 'organization_tag_ids',
        label: this.translate.instant('Tags'),
        options: []
    };

    public constructor(
        store: StorageService,
        historyService: HistoryService,
        organizationTagRepo: OrganizationTagRepositoryService,
        private translate: TranslateService
    ) {
        super(store, historyService);
        this.updateFilterForRepo(organizationTagRepo, this.orgaTagFilterOptions, this.translate.instant('No tags'));
    }

    protected getFilterDefinitions(): OsFilter<ViewCommittee>[] {
        return [
            {
                property: 'hasForwardings',
                label: this.translate.instant('Forward motions'),
                options: [
                    { label: this.translate.instant('Can forward motions'), condition: true },
                    { label: this.translate.instant('Cannot forward motions'), condition: false }
                ]
            },
            {
                property: 'hasReceivings',
                label: this.translate.instant('Receive motions'),
                options: [
                    { label: this.translate.instant('Can receive motions'), condition: true },
                    { label: this.translate.instant('Cannot receive motions'), condition: false }
                ]
            },
            this.orgaTagFilterOptions
        ];
    }
}
