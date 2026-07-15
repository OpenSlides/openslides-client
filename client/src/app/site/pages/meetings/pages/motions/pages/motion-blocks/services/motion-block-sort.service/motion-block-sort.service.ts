import { Injectable, ProviderToken } from '@angular/core';
import { BaseRepository } from '@app/gateways/repositories/base-repository';
import { MotionBlockRepositoryService } from '@app/gateways/repositories/motions';
import { BaseSortListService, OsSortingOption } from '@app/site/base/base-sort.service';
import { ViewMotionBlock } from '@app/site/pages/meetings/pages/motions';
import { _ } from '@ngx-translate/core';

@Injectable({
    providedIn: `root`
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
            label: _(`Amount of motions`),
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
