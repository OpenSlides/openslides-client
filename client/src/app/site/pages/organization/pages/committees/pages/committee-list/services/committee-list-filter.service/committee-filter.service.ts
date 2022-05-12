import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewCommittee } from '../../../../view-models';
import { CommitteeListServiceModule } from '../committee-list-service.module';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { OrganizationTagControllerService } from 'src/app/site/pages/organization/pages/organization-tags/services/organization-tag-controller.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

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

    public constructor(organizationTagRepo: OrganizationTagControllerService, private translate: TranslateService) {
        super();
        this.updateFilterForRepo({
            repo: organizationTagRepo,
            filter: this.orgaTagFilterOptions,
            noneOptionLabel: _(`No tags`)
        });
    }

    protected getFilterDefinitions(): OsFilter<ViewCommittee>[] {
        return [
            {
                property: `hasForwardings`,
                label: _(`Forward motions`),
                options: [
                    { label: _(`Can forward motions`), condition: true },
                    { label: _(`Cannot forward motions`), condition: false }
                ]
            },
            {
                property: `hasReceivings`,
                label: _(`Receive motions`),
                options: [
                    { label: _(`Can receive motions`), condition: true },
                    { label: _(`Cannot receive motions`), condition: false }
                ]
            },
            this.orgaTagFilterOptions
        ];
    }
}
