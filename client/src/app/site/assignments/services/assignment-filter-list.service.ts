import { Injectable } from '@angular/core';

import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { BaseFilterListService, OsFilter, OsFilterOption } from 'app/core/ui-services/base-filter-list.service';
import { AssignmentPhases, ViewAssignment } from '../models/view-assignment';

/**
 * Filter service for the assignment list
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentFilterListService extends BaseFilterListService<ViewAssignment> {
    /**
     * set the storage key name
     */
    protected storageKey = 'AssignmentList';

    /**
     * Constructor. Activates the phase options subscription
     *
     * @param store StorageService
     * @param translate translate service
     */
    public constructor(store: StorageService, historyService: HistoryService) {
        super(store, historyService);
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewAssignment>[] {
        return [
            {
                label: 'Phase',
                property: 'phase',
                options: this.createPhaseOptions()
            }
        ];
    }

    /**
     * Creates options for assignment phases
     */
    private createPhaseOptions(): OsFilterOption[] {
        return AssignmentPhases.map(ap => ({ label: ap.display_name, condition: ap.value, isActive: false }));
    }
}
