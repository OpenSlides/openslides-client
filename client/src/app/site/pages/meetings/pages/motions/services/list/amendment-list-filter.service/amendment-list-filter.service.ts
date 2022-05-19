import { Injectable } from '@angular/core';
import { MotionListFilterService } from '../motion-list-filter.service';
import { MotionsListServiceModule } from '../motions-list-service.module';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { TranslateService } from '@ngx-translate/core';
import { TagControllerService } from '../../../modules/tags/services';
import { MotionWorkflowControllerService } from '../../../modules/workflows/services';
import { MotionCommentSectionControllerService } from '../../../modules/comments/services';
import { MotionBlockControllerService } from '../../../modules/motion-blocks/services';
import { MotionCategoryControllerService } from '../../../modules/categories/services';
import { MotionControllerService } from '../../common/motion-controller.service';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';
import { StorageService } from 'src/app/gateways/storage.service';

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
    // protected override storageKey: string = ``;

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
        baseFilterListService: BaseFilterListService<ViewMotion>,
        history: HistoryService,
        store: StorageService,
        categoryRepo: MotionCategoryControllerService,
        motionBlockRepo: MotionBlockControllerService,
        commentRepo: MotionCommentSectionControllerService,
        tagRepo: TagControllerService,
        workflowRepo: MotionWorkflowControllerService,
        protected override translate: TranslateService,
        operator: OperatorService,
        meetingSettingsService: MeetingSettingsService,
        motionRepo: MotionControllerService
    ) {
        super(
            baseFilterListService,
            store,
            history,
            categoryRepo,
            motionBlockRepo,
            commentRepo,
            tagRepo,
            workflowRepo,
            translate,
            operator,
            meetingSettingsService
        );

        this.filterListData.storageKey = ``;

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
            this.filterListData.storageKey = `${this.keyPrefix}_parentId_${this._parentMotionId}`;
        } else {
            this.filterListData.storageKey = this.keyPrefix;
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
     * Override the parents 'isWorkflowEnabled', only consider the enabledWorkflows.amendment
     */
    protected override isWorkflowEnabled(workflowId: number): boolean {
        return workflowId === this.enabledWorkflows.amendment;
    }
}
