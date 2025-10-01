import { inject, Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { StorageService } from 'src/app/gateways/storage.service';
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

    private _hierarchyFilterActive = false;

    public get hierarchyFilterActive(): boolean {
        return this._hierarchyFilterActive;
    }

    public set hierarchyFilterActive(value) {
        this._hierarchyFilterActive = value;
    }

    private expandedCommittees: Set<number> = new Set<number>();

    private orgaTagFilterOptions: OsFilter<ViewCommittee> = {
        property: `organization_tag_ids`,
        label: _(`Tags`),
        isAndConnected: true,
        options: []
    };

    private store = inject(StorageService);

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

    public override get outputObservable(): Observable<ViewCommittee[]> {
        return super.outputObservable.pipe(
            map(output => {
                if (this.hierarchyFilterActive) {
                    return output.filter(
                        el =>
                            !el.all_parent_ids?.length ||
                            el.all_parent_ids?.every(id => this.expandedCommittees.has(id))
                    );
                }

                return output;
            })
        );
    }

    public override storeActiveFilters(): void {
        super.storeActiveFilters();
        this.store.set(`${this.storageKey}_expanded`, Array.from(this.expandedCommittees));
    }

    public override async initFilters(inputData: Observable<ViewCommittee[]>): Promise<void> {
        const expanded = await this.store.get<number[]>(`${this.storageKey}_expanded`);
        if (expanded) {
            this.expandedCommittees = new Set(expanded);
        }

        await super.initFilters(inputData);
    }

    public isExpanded(id: Id): boolean {
        return this.expandedCommittees.has(id);
    }

    public toggleExpanded(id: Id): void {
        if (this.expandedCommittees.has(id)) {
            this.expandedCommittees.delete(id);
        } else {
            this.expandedCommittees.add(id);
        }

        this.storeActiveFilters();
    }
}
