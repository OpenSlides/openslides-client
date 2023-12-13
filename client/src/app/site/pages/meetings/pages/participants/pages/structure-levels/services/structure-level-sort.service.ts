import { Injectable, Injector, ProviderToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { StructureLevelRepositoryService } from 'src/app/gateways/repositories/structure-levels';
import { StorageService } from 'src/app/gateways/storage.service';
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

    private StructureLevelSortOptions: OsSortingOption<ViewStructureLevel>[] = [
        { property: `name` },
    ];

    public constructor(translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, {
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
