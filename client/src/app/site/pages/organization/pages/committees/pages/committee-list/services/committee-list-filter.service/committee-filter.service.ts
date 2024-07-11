import { Injectable } from '@angular/core';
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
        label: `Tags`,
        isAndConnected: true,
        options: []
    };

    public constructor(organizationTagRepo: OrganizationTagControllerService, store: ActiveFiltersService) {
        super(store);
        this.updateFilterForRepo({
            repo: organizationTagRepo,
            filter: this.orgaTagFilterOptions,
            noneOptionLabel: `not specified`
        });
    }

    protected getFilterDefinitions(): OsFilter<ViewCommittee>[] {
        return [
            {
                property: `hasForwardings`,
                label: `Forward motions`,
                options: [
                    { label: `Can forward motions`, condition: true },
                    { label: `Cannot forward motions`, condition: [false, null] }
                ]
            },
            {
                property: `hasReceivings`,
                label: `Receive motions`,
                options: [
                    { label: `Can receive motions`, condition: true },
                    { label: `Cannot receive motions`, condition: [false, null] }
                ]
            },
            this.orgaTagFilterOptions
        ];
    }
}
