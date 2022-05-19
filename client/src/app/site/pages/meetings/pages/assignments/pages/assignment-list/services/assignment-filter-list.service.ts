import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseFilterListService, OsFilter, OsFilterOption } from 'src/app/site/base/base-filter.service';
import { BaseMeetingFilterListService } from 'src/app/site/pages/meetings/base/base-meeting-filter-list.service';
import { HistoryService } from '../../../../history/services/history.service';
import { AssignmentPhases } from '../../../definitions';
import { ViewAssignment } from '../../../view-models';
import { AssignmentListServiceModule } from './assignment-list-service.module';

/**
 * Filter service for the assignment list
 */
@Injectable({
    providedIn: AssignmentListServiceModule
})
export class AssignmentFilterListService extends BaseMeetingFilterListService<ViewAssignment> {
    /**
     * set the storage key name
     */
    // protected storageKey = `AssignmentList`;

    constructor(baseFilterListService: BaseFilterListService<ViewAssignment>, historyService: HistoryService,
        store: StorageService) {
        super(baseFilterListService, store, historyService, `AssignmentList`)
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewAssignment>[] {
        return [
            {
                label: `Phase`,
                property: `phase`,
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
