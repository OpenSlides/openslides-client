import { Service } from '@angular/core';

import { MotionListBaseSortService } from '../motion-list-base-sort.service';

@Service()
export class MotionListSortService extends MotionListBaseSortService {
    /**
     * Constructor.
     */
    public constructor() {
        super(null);
    }
}
