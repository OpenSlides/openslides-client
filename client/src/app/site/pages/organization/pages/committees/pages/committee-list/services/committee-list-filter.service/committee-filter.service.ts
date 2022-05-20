import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';
import { OrganizationTagControllerService } from 'src/app/site/pages/organization/pages/organization-tags/services/organization-tag-controller.service';

import { ViewCommittee } from '../../../../view-models';
import { CommitteeListServiceModule } from '../committee-list-service.module';

@Injectable({
    providedIn: CommitteeListServiceModule
})
export class CommitteeFilterService extends BaseFilterListService<ViewCommittee> {
    protected storageKey = `CommitteeList`;

    private orgaTagFilterOptions: OsFilter<ViewCommittee> = {
        property: `organization_tag_ids`,
        label: this.translate.instant(`Tags`),
        isAndConnected: true,
        options: []
    };

    public constructor(
        organizationTagRepo: OrganizationTagControllerService,
        store: StorageService,
        history: HistoryService,
        private translate: TranslateService
    ) {
        super(store, history);
        this.updateFilterForRepo({
            repo: organizationTagRepo,
            filter: this.orgaTagFilterOptions,
            noneOptionLabel: this.translate.instant(`No tags`)
        });
    }

    protected getFilterDefinitions(): OsFilter<ViewCommittee>[] {
        return [
            {
                property: `hasForwardings`,
                label: this.translate.instant(`Forward motions`),
                options: [
                    { label: this.translate.instant(`Can forward motions`), condition: true },
                    { label: this.translate.instant(`Cannot forward motions`), condition: false }
                ]
            },
            {
                property: `hasReceivings`,
                label: this.translate.instant(`Receive motions`),
                options: [
                    { label: this.translate.instant(`Can receive motions`), condition: true },
                    { label: this.translate.instant(`Cannot receive motions`), condition: false }
                ]
            },
            this.orgaTagFilterOptions
        ];
    }
}
