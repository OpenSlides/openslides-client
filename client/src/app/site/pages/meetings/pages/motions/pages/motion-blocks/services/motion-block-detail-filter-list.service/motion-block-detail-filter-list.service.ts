import { inject, Service } from '@angular/core';
import { ViewMotion } from '@app/site/pages/meetings/pages/motions';
import { TranslateService } from '@ngx-translate/core';

import { MotionListFilterService } from '../../../../services/list/motion-list-filter.service';

@Service()
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

    protected override translate = inject(TranslateService);

    /**
     * @override from parent
     * @param viewMotions
     * @return
     */
    protected override preFilter(viewMotions: ViewMotion[]): ViewMotion[] {
        return viewMotions.filter(motion => motion.block_id === this._blockId);
    }
}
