import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
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
        label: _(`Tags`),
        isAndConnected: true,
        options: []
    };

    public constructor(organizationTagRepo: OrganizationTagControllerService, store: ActiveFiltersService) {
        super(store);
        this.updateFilterForRepo({
            repo: organizationTagRepo,
            filter: this.orgaTagFilterOptions,
            noneOptionLabel: _(`not specified`)
        });
    }

    protected getFilterDefinitions(): OsFilter<ViewCommittee>[] {
        return [
            {
                property: `hasForwardings`,
                label: _(`Forward motions`),
                options: [
                    { label: _(`Can forward motions`), condition: true },
                    { label: _(`Cannot forward motions`), condition: [false, null] }
                ]
            },
            {
                property: `hasReceivings`,
                label: _(`Receive motions`),
                options: [
                    { label: _(`Can receive motions`), condition: true },
                    { label: _(`Cannot receive motions`), condition: [false, null] }
                ]
            },
            this.orgaTagFilterOptions
        ];
    }
}
