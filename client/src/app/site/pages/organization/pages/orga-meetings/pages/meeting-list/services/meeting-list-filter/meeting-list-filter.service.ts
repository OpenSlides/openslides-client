import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { RelatedTime, ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { OrganizationTagControllerService } from '../../../../../organization-tags/services/organization-tag-controller.service';
import { MeetingListServiceModule } from '../meeting-list-service.module';

@Injectable({
    providedIn: MeetingListServiceModule
})
export class MeetingListFilterService extends BaseFilterListService<ViewMeeting> {
    protected storageKey = `MeetingList`;

    private orgaTagFilterOptions: OsFilter<ViewMeeting> = {
        property: `organization_tag_ids`,
        label: _(`Tags`),
        isAndConnected: true,
        options: []
    };

    public constructor(
        store: ActiveFiltersService,
        private operator: OperatorService,
        organizationTagRepo: OrganizationTagControllerService
    ) {
        super(store);
        this.updateFilterForRepo({
            repo: organizationTagRepo,
            filter: this.orgaTagFilterOptions,
            noneOptionLabel: _(`No tags`)
        });
    }

    protected getFilterDefinitions(): OsFilter<ViewMeeting>[] {
        let filters: OsFilter<ViewMeeting>[] = [
            {
                property: `isArchived`,
                label: _(`Archived`),
                options: [
                    { label: _(`Is archived`), condition: true },
                    { label: _(`Is not archived`), condition: [false, null] }
                ]
            },
            {
                property: `relatedTime`,
                label: _(`Time`),
                options: [
                    { label: _(`today`), condition: RelatedTime.Current },
                    { label: _(`ended`), condition: RelatedTime.Past },
                    { label: _(`future`), condition: RelatedTime.Future },
                    { label: _(`dateless`), condition: RelatedTime.Dateless }
                ]
            },
            this.orgaTagFilterOptions
        ];

        if (this.operator.hasOrganizationPermissions(OML.can_manage_organization)) {
            filters = filters.concat({
                property: `isTemplate`,
                label: _(`Public template`),
                options: [
                    { label: _(`Is a template`), condition: true },
                    { label: _(`Is not a template`), condition: [false, null] }
                ]
            });
        }

        return filters;
    }
}
