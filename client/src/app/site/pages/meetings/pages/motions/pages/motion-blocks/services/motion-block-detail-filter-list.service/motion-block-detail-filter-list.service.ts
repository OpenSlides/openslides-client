import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingActiveFiltersService } from 'src/app/site/pages/meetings/services/meeting-active-filters.service';

import { MotionListFilterService } from '../../../../services/list/motion-list-filter.service';
import { MotionBlockServiceModule } from '../motion-block-service.module';

@Injectable({
    providedIn: MotionBlockServiceModule
})
export class MotionBlockDetailFilterListService extends MotionListFilterService {
    protected override storageKey = `MotionBlock`;

    /**
     * setter for the blockId
     */
    public set blockId(id: number) {
        this._blockId = id;
    }

    /**
     * Private acessor for the blockId
     */
    private _blockId = 0;

    public constructor(store: MeetingActiveFiltersService, protected override translate: TranslateService) {
        super(store);
    }

    /**
     * @override from parent
     * @param viewMotions
     * @return
     */
    protected override preFilter(viewMotions: ViewMotion[]): ViewMotion[] {
        return viewMotions.filter(motion => motion.block_id === this._blockId);
    }
}
