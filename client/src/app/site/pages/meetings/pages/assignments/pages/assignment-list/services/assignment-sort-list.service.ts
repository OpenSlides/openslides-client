import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';

import { AssignmentListServiceModule } from './assignment-list-service.module';

/**
 * Sorting service for the assignment list
 */
@Injectable({
    providedIn: AssignmentListServiceModule
})
export class AssignmentSortListService extends BaseSortListService<ViewAssignment> {
    /**
     * set the storage key name
     */
    protected storageKey = `AssignmentList`;

    /**
     * Define the sort options
     */
    private assignmentSortOptions: OsSortingOption<ViewAssignment>[] = [
        { property: `title`, label: `Name` },
        { property: `phase`, label: `Phase` },
        { property: `candidateAmount`, label: `Number of candidates` },
        { property: `id`, label: `Creation date` }
    ];

    constructor(translate: TranslateService, store: StorageService) {
        super(translate, store, {
            sortProperty: `title`,
            sortAscending: true
        });
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewAssignment>[] {
        return this.assignmentSortOptions;
    }
}
