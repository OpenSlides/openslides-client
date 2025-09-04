import { Injectable, ProviderToken } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { CommitteeRepositoryService } from 'src/app/gateways/repositories/committee-repository.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';

import { ViewCommittee } from '../../../../view-models';

@Injectable({
    providedIn: `root`
})
export class CommitteeSortService extends BaseSortListService<ViewCommittee> {
    protected storageKey = `CommitteeList`;

    private hierarchySort = true;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = CommitteeRepositoryService;

    private readonly staticSortOptions: OsSortingOption<ViewCommittee>[] = [
        { property: `name`, label: _(`Title`) },
        { property: `meetingAmount`, label: _(`Amount of meetings`), baseKeys: [`meeting_ids`] },
        { property: `memberAmount`, label: _(`Amount of accounts`), baseKeys: [`user_ids`] }
    ];

    public constructor() {
        super({
            sortProperty: `name`,
            sortAscending: true
        });
    }

    protected getSortOptions(): OsSortingOption<ViewCommittee>[] {
        return this.staticSortOptions;
    }

    /**
     * Sorts the given array according to this services sort settings and returns it.
     */
    public override async sort(array: ViewCommittee[]): Promise<ViewCommittee[]> {
        if (this.hierarchySort) {
            const input = [...array];
            return (await this.doHierarchySort(input, null)).flat(Infinity);
        }

        return super.sort(array);
    }

    private async doHierarchySort(remaining: ViewCommittee[], parentId: Id): Promise<ViewCommittee[]> {
        const result = [];
        let i = remaining.length;
        while (i--) {
            const entry = remaining[i];
            if (entry && (entry.parent_id ?? null) === parentId) {
                remaining.splice(i, 1);
                result.push([entry, await this.doHierarchySort(remaining, entry.id)]);
            }
        }

        const alternativeProperty = (await this.getDefaultDefinition()).sortProperty;
        return result.sort((a, b) => this.compareHelperFunction(a[0], b[0], alternativeProperty));
    }
}
