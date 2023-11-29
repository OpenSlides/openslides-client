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
     *
     * @param translate required by parent
     * @param store required by parent
     * @param config set the default sorting according to OpenSlides configuration
     */
    public constructor(protected override translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, null);
    }
}
