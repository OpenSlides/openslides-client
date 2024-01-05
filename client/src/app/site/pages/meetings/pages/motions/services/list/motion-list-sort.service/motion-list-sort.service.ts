import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MotionListBaseSortService } from '../motion-list-base-sort.service';

@Injectable({
    providedIn: `root`
})
export class MotionListSortService extends MotionListBaseSortService {
    protected override translate = inject(TranslateService);
    /**
     * Constructor.
     *
     * @param translate required by parent
     * @param store required by parent
     * @param config set the default sorting according to OpenSlides configuration
     */
    public constructor() {
        super(null);
    }
}
