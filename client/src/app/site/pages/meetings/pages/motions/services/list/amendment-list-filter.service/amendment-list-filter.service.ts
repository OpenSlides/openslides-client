import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OsFilter } from 'src/app/site/base/base-filter.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

import { MotionControllerService } from '../../common/motion-controller.service';
import { MotionListFilterService } from '../motion-list-filter.service';
import { MotionsListServiceModule } from '../motions-list-service.module';

@Injectable({
    providedIn: MotionsListServiceModule
})
export class AmendmentListFilterService extends MotionListFilterService {
    /**
     * Private accessor for an amendment id
     */
    public _parentMotionId: number | null = null;

    /**
     * set the storage key nae
     */
    protected override storageKey = ``;

    /**
     * The sorage key prefix to identify the parent id
     */
    private keyPrefix = `AmendmentList`;

    /**
     * Filters by motion parent id
     */
    private motionFilterOptions: OsFilter<ViewMotion> = {
        property: `lead_motion_id`,
        label: `Motion`,
        options: []
    };

    /**
     * publicly get an amendment id
     */
    public set parentMotionId(id: number | null) {
        this._parentMotionId = id;
        this.updateStorageKey();
    }

    public constructor(
        store: ActiveFiltersService,
        protected override translate: TranslateService,
        motionRepo: MotionControllerService
    ) {
        super(store);

        this.updateFilterForRepo({
            repo: motionRepo,
            filter: this.motionFilterOptions,
            filterFn: (model: ViewMotion) => motionRepo.hasAmendments(model)
        });
    }

    /**
     * Function to define a new storage key by parent id
     */
    private updateStorageKey(): void {
        if (this._parentMotionId) {
            this.storageKey = `${this.keyPrefix}_parentId_${this._parentMotionId}`;
        } else {
            this.storageKey = this.keyPrefix;
        }
    }

    /**
     * @override from base filter list service
     *
     * @returns the only motons with a parentId
     */
    protected override preFilter(motions: ViewMotion[]): ViewMotion[] {
        return motions.filter(motion => {
            if (this._parentMotionId) {
                return motion.lead_motion_id === this._parentMotionId;
            } else {
                return !!motion.lead_motion_id;
            }
        });
    }

    /**
     * Currently, no filters for the amendment list, except the pre-filter
     */
    protected override getFilterDefinitions(): OsFilter<ViewMotion>[] {
        if (this.motionFilterOptions) {
            return [this.motionFilterOptions].concat(super.getFilterDefinitions());
        }
        return [];
    }

    /**
     * Override the parents 'isWorkflowEnabled', only consider the enabledWorkflows.amendment if it exists
     */
    protected override isWorkflowEnabled(workflowId: number): boolean {
        return workflowId === (this.enabledWorkflows.amendment ?? this.enabledWorkflows.motion);
    }
}
