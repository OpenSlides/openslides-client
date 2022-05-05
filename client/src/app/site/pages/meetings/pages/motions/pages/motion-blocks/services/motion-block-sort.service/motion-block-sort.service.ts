import { Injectable } from '@angular/core';
import { MotionBlockServiceModule } from '../motion-block-service.module';
import { BaseSortListService, OsSortingOption, OsSortingDefinition } from 'src/app/site/base/base-sort.service';
import { ViewMotionBlock } from 'src/app/site/pages/meetings/pages/motions';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';

@Injectable({
    providedIn: MotionBlockServiceModule
})
export class MotionBlockSortService extends BaseSortListService<ViewMotionBlock> {
    /**
     * set the storage key name
     */
    protected storageKey = `MotionBlockList`;

    private MotionBlockSortOptions: OsSortingOption<ViewMotionBlock>[] = [
        { property: `title` },
        {
            property: `motions`,
            label: `Amount of motions`,
            sortFn: (aBlock, bBlock, ascending) =>
                ascending
                    ? aBlock.motions.length - bBlock.motions.length
                    : bBlock.motions.length - aBlock.motions.length
        }
    ];

    public constructor(translate: TranslateService, store: StorageService) {
        super(translate, store);
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewMotionBlock>[] {
        return this.MotionBlockSortOptions;
    }

    protected async getDefaultDefinition(): Promise<OsSortingDefinition<ViewMotionBlock>> {
        return {
            sortProperty: `title`,
            sortAscending: true
        };
    }
}
