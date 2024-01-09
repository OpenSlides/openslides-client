import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';

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
