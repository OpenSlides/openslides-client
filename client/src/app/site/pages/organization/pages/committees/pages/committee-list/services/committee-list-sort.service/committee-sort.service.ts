import { Injectable, ProviderToken } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, withLatestFrom } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { CommitteeRepositoryService } from 'src/app/gateways/repositories/committee-repository.service';
import { BaseSortListService, OsSortingDefinition, OsSortingOption } from 'src/app/site/base/base-sort.service';

import { ViewCommittee } from '../../../../view-models';

@Injectable({
    providedIn: `root`
})
export class CommitteeSortService extends BaseSortListService<ViewCommittee> {
    protected storageKey = `CommitteeList`;

    private _hierarchySort = new BehaviorSubject(true);
    public get hierarchySort(): boolean {
        return this._hierarchySort.value;
    }

    public set hierarchySort(value: boolean) {
        this._hierarchySort.next(value);
    }

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
     * Updates every time when there's a new sortDefinition. Emits said sortDefinition.
     */
    public override get sortingUpdatedObservable(): Observable<OsSortingDefinition<ViewCommittee>> {
        return super.sortingUpdatedObservable.pipe(
            withLatestFrom(this._hierarchySort),
            map(([sort, _]) => sort)
        );
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
