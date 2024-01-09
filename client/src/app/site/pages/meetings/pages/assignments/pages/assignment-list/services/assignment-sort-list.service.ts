import { Injectable, ProviderToken } from '@angular/core';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';

/**
 * Sorting service for the assignment list
 */
@Injectable({
    providedIn: `root`
})
export class AssignmentSortListService extends BaseSortListService<ViewAssignment> {
    /**
     * set the storage key name
     */
    protected storageKey = `AssignmentList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = AssignmentRepositoryService;

    /**
     * Define the sort options
     */
    private assignmentSortOptions: OsSortingOption<ViewAssignment>[] = [
        { property: `title`, label: `Name` },
        { property: `phase`, label: `Phase` },
        { property: `candidateAmount`, label: `Number of candidates`, baseKeys: [`candidate_ids`] },
        { property: `id`, label: `Creation date` }
    ];

    constructor() {
        super({
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
