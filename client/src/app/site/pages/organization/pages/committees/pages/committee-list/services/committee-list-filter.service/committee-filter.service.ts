import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { OrganizationTagControllerService } from 'src/app/site/pages/organization/pages/organization-tags/services/organization-tag-controller.service';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

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
        store: ActiveFiltersService,
        private translate: TranslateService
    ) {
        super(store);
        this.updateFilterForRepo({
            repo: organizationTagRepo,
            filter: this.orgaTagFilterOptions,
            noneOptionLabel: this.translate.instant(`not specified`)
        });
    }

    protected getFilterDefinitions(): OsFilter<ViewCommittee>[] {
        return [
            {
                property: `hasForwardings`,
                label: this.translate.instant(`Forward motions`),
                options: [
                    { label: this.translate.instant(`Can forward motions`), condition: true },
                    { label: this.translate.instant(`Cannot forward motions`), condition: [false, null] }
                ]
            },
            {
                property: `hasReceivings`,
                label: this.translate.instant(`Receive motions`),
                options: [
                    { label: this.translate.instant(`Can receive motions`), condition: true },
                    { label: this.translate.instant(`Cannot receive motions`), condition: [false, null] }
                ]
            },
            this.orgaTagFilterOptions
        ];
    }
}
