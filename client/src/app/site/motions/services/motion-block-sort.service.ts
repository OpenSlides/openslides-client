import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { OsSortingDefinition, OsSortingOption } from 'app/core/ui-services/base-sort.service';
import { BaseSortListService } from 'app/core/ui-services/base-sort-list.service';

import { ViewMotionBlock } from '../models/view-motion-block';

@Injectable({
    providedIn: `root`
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

    public constructor(translate: TranslateService, store: StorageService, historyService: HistoryService) {
        super(translate, store, historyService);
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
