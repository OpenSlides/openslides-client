import { Injectable } from '@angular/core';
import { OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionListBaseSortService } from '../motion-list-base-sort.service';

@Injectable({
    providedIn: `root`
})
export class AmendmentListSortService extends MotionListBaseSortService {
    /**
     * set the storage key name
     */
    protected override storageKey = `AmendmentList`;

    private amendmentSortOptions: OsSortingOption<ViewMotion>[] = [
        {
            property: `parentAndLineNumber`,
            label: this.translate.instant(`Main motion and line number`),
            baseKeys: [`amendment_paragraphs`],
            foreignBaseKeys: {
                motion: [`number`, `text`],
                motion_change_recommendation: [`rejected`],
                meeting: [`motions_line_length`]
            }
        }
    ];

    constructor() {
        super({
            sortProperty: `parentAndLineNumber`,
            sortAscending: true
        });
    }

    protected override getSortOptions(): OsSortingOption<ViewMotion>[] {
        return this.amendmentSortOptions.concat(super.getSortOptions());
    }
}
