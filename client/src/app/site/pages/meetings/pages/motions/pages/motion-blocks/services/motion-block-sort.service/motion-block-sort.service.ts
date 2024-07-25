import { Injectable, ProviderToken } from '@angular/core';
import { BaseBackendRepository } from 'src/app/gateways/repositories/base-backend-repository';
import { MotionBlockRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewMotionBlock } from 'src/app/site/pages/meetings/pages/motions';

@Injectable({
    providedIn: `root`
})
export class MotionBlockSortService extends BaseSortListService<ViewMotionBlock> {
    /**
     * set the storage key name
     */
    protected storageKey = `MotionBlockList`;

    protected repositoryToken: ProviderToken<BaseBackendRepository<any, any>> = MotionBlockRepositoryService;

    private MotionBlockSortOptions: OsSortingOption<ViewMotionBlock>[] = [
        { property: `title` },
        {
            property: `motions`,
            label: `Amount of motions`,
            sortFn: (aBlock, bBlock, ascending): number =>
                ascending
                    ? aBlock.motions.length - bBlock.motions.length
                    : bBlock.motions.length - aBlock.motions.length,
            baseKeys: [`motion_ids`]
        }
    ];

    public constructor() {
        super({
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
