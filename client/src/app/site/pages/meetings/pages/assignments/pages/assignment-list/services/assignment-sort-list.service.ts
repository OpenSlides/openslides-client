import { Injectable } from '@angular/core';
import { BaseSortListService, OsSortingOption, OsSortingDefinition } from 'src/app/site/base/base-sort.service';
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

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewAssignment>[] {
        return this.assignmentSortOptions;
    }

    /**
     * Required by parent
     *
     * @returns the default sorting strategy
     */
    public async getDefaultDefinition(): Promise<OsSortingDefinition<ViewAssignment>> {
        return {
            sortProperty: `title`,
            sortAscending: true
        };
    }
}
