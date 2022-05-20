import { Injectable } from '@angular/core';
import { OsSortingDefinition, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionListSortService } from '../motion-list-sort.service';
import { MotionsListServiceModule } from '../motions-list-service.module';

@Injectable({
    providedIn: MotionsListServiceModule
})
export class AmendmentListSortService extends MotionListSortService {
    /**
     * set the storage key name
     */
    protected override storageKey = `AmendmentList`;

    private amendmentSortOptions: OsSortingOption<ViewMotion>[] = [
        {
            property: `parentAndLineNumber`,
            label: this.translate.instant(`Main motion and line number`)
        }
    ];

    protected override getSortOptions(): OsSortingOption<ViewMotion>[] {
        return this.amendmentSortOptions.concat(super.getSortOptions());
    }

    protected override async getDefaultDefinition(): Promise<OsSortingDefinition<ViewMotion>> {
        return {
            sortProperty: `parentAndLineNumber`,
            sortAscending: true
        };
    }
}
