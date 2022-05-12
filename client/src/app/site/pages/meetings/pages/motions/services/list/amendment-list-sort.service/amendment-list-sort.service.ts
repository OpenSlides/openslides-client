import { Injectable } from '@angular/core';
import { MotionListSortService } from '../motion-list-sort.service';
import { MotionsListServiceModule } from '../motions-list-service.module';
import { OsSortingOption, OsSortingDefinition } from 'src/app/site/base/base-sort.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

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
            label: _(`Main motion and line number`)
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
