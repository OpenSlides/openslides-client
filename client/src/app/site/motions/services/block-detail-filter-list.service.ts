import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { HistoryService } from 'app/core/core-services/history.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { MotionFilterListService } from './motion-filter-list.service';
import { ViewMotion } from '../models/view-motion';

/**
 * Filter service for motion blocks
 */
@Injectable({
    providedIn: 'root'
})
export class BlockDetailFilterListService extends MotionFilterListService {
    /**
     * Private acessor for the blockId
     */
    private _blockId: number;

    /**
     * setter for the blockId
     */
    public set blockId(id: number) {
        this._blockId = id;
    }

    /**
     *
     * @param store
     * @param historyService
     * @param categoryRepo
     * @param motionBlockRepo
     * @param commentRepo
     * @param tagRepo
     * @param workflowRepo
     * @param translate
     * @param operator
     * @param config
     */
    public constructor(
        store: StorageService,
        historyService: HistoryService,
        categoryRepo: MotionCategoryRepositoryService,
        motionBlockRepo: MotionBlockRepositoryService,
        commentRepo: MotionCommentSectionRepositoryService,
        tagRepo: TagRepositoryService,
        workflowRepo: MotionWorkflowRepositoryService,
        translate: TranslateService,
        operator: OperatorService,
        meetingSettingsService: MeetingSettingsService
    ) {
        super(
            store,
            historyService,
            categoryRepo,
            motionBlockRepo,
            commentRepo,
            tagRepo,
            workflowRepo,
            translate,
            operator,
            meetingSettingsService
        );
    }

    /**
     * @override from parent
     * @param viewMotions
     * @return
     */
    protected preFilter(viewMotions: ViewMotion[]): ViewMotion[] {
        return viewMotions.filter(motion => motion.block_id === this._blockId);
    }
}
