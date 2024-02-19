import { Injectable, ProviderToken } from '@angular/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { StructureLevelRepositoryService } from 'src/app/gateways/repositories/structure-levels';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewStructureLevel } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';

@Injectable({
    providedIn: `root`
})
export class StructureLevelSortService extends BaseSortListService<ViewStructureLevel> {
    /**
     * set the storage key name
     */
    protected storageKey = `StructureLevelList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = StructureLevelRepositoryService;

    private StructureLevelSortOptions: OsSortingOption<ViewStructureLevel>[] = [{ property: `name` }];

    public constructor() {
        super({
            sortProperty: `name`,
            sortAscending: true
        });
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewStructureLevel>[] {
        return this.StructureLevelSortOptions;
    }
}
