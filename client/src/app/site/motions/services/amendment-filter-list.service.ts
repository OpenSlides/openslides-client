import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { OpenSlidesStatusService } from 'app/core/core-services/openslides-status.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { OsFilter } from 'app/core/ui-services/base-filter-list.service';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { MotionFilterListService } from './motion-filter-list.service';
import { ViewMotion } from '../models/view-motion';

/**
 * Filter the list of Amendments
 */
@Injectable({
    providedIn: 'root'
})
export class AmendmentFilterListService extends MotionFilterListService {
    /**
     * Private accessor for an amendment id
     */
    public _parentMotionId: number;

    /**
     * set the storage key nae
     */
    protected storageKey: string;

    /**
     * The sorage key prefix to identify the parent id
     */
    private keyPrefix = 'AmendmentList';

    /**
     * Filters by motion parent id
     */
    private motionFilterOptions: OsFilter = {
        property: 'parent_id',
        label: 'Motion',
        options: []
    };

    /**
     * publicly get an amendment id
     */
    public set parentMotionId(id: number) {
        this._parentMotionId = id;
        this.updateStorageKey();
    }

    public constructor(
        store: StorageService,
        OSStatus: OpenSlidesStatusService,
        categoryRepo: MotionCategoryRepositoryService,
        motionBlockRepo: MotionBlockRepositoryService,
        commentRepo: MotionCommentSectionRepositoryService,
        tagRepo: TagRepositoryService,
        workflowRepo: MotionWorkflowRepositoryService,
        translate: TranslateService,
        operator: OperatorService,
        organisationSettingsService: OrganisationSettingsService,
        motionRepo: MotionRepositoryService
    ) {
        super(
            store,
            OSStatus,
            categoryRepo,
            motionBlockRepo,
            commentRepo,
            tagRepo,
            workflowRepo,
            translate,
            operator,
            organisationSettingsService
        );

        this.updateFilterForRepo(motionRepo, this.motionFilterOptions, null, (model: ViewMotion) =>
            motionRepo.hasAmendments(model)
        );
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
    protected preFilter(motions: ViewMotion[]): ViewMotion[] {
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
    protected getFilterDefinitions(): OsFilter[] {
        if (this.motionFilterOptions) {
            return [this.motionFilterOptions].concat(super.getFilterDefinitions());
        }
    }
}
