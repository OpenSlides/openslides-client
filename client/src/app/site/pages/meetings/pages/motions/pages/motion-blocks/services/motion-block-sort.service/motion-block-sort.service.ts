import { Injectable, Injector, ProviderToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MotionBlockRepositoryService } from 'src/app/gateways/repositories/motions';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewMotionBlock } from 'src/app/site/pages/meetings/pages/motions';

import { MotionBlockServiceModule } from '../motion-block-service.module';

@Injectable({
    providedIn: MotionBlockServiceModule
})
export class MotionBlockSortService extends BaseSortListService<ViewMotionBlock> {
    /**
     * set the storage key name
     */
    protected storageKey = `MotionBlockList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = MotionBlockRepositoryService;

    private MotionBlockSortOptions: OsSortingOption<ViewMotionBlock>[] = [
        { property: `title` },
        {
            property: `motions`,
            label: `Amount of motions`,
            sortFn: (aBlock, bBlock, ascending) =>
                ascending
                    ? aBlock.motions.length - bBlock.motions.length
                    : bBlock.motions.length - aBlock.motions.length,
            baseKeys: [`motion_ids`]
        }
    ];

    public constructor(translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, {
            sortProperty: `title`,
            sortAscending: true
        });
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewMotionBlock>[] {
        return this.MotionBlockSortOptions;
    }
}
