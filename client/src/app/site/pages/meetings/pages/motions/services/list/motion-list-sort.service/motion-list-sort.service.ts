import { Injectable } from '@angular/core';

import { MotionListBaseSortService } from '../motion-list-base-sort.service';

@Injectable({
    providedIn: `root`
})
export class MotionListSortService extends MotionListBaseSortService {
    /**
     * Constructor.
     */
    public constructor() {
        super(null);
    }
}
