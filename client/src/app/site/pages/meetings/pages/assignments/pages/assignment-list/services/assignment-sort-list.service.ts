import { Injectable, Injector, ProviderToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
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

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = AssignmentRepositoryService;

    /**
     * Define the sort options
     */
    private assignmentSortOptions: OsSortingOption<ViewAssignment>[] = [
        { property: `title`, label: `Name` },
        { property: `phase`, label: `Phase` },
        { property: `candidateAmount`, label: `Number of candidates` },
        { property: `id`, label: `Creation date` }
    ];

    constructor(translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, {
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
