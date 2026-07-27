import { ProviderToken, Service } from '@angular/core';
import { BaseRepository } from '@app/gateways/repositories/base-repository';
import { StructureLevelRepositoryService } from '@app/gateways/repositories/structure-levels';
import { BaseSortListService, OsSortingOption } from '@app/site/base/base-sort.service';
import { ViewStructureLevel } from '@app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';

@Service()
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
