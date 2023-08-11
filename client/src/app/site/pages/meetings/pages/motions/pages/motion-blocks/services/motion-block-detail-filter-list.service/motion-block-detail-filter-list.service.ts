import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingActiveFiltersService } from 'src/app/site/pages/meetings/services/meeting-active-filters.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { MotionCommentSectionControllerService } from '../../../../modules/comments/services';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services';
import { TagControllerService } from '../../../../modules/tags/services';
import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';
import { MotionListFilterService } from '../../../../services/list/motion-list-filter.service';
import { MotionBlockServiceModule } from '../motion-block-service.module';

@Injectable({
    providedIn: MotionBlockServiceModule
})
export class MotionBlockDetailFilterListService extends MotionListFilterService {
    protected override storageKey: string = `MotionBlock`;

    /**
     * setter for the blockId
     */
    public set blockId(id: number) {
        this._blockId = id;
    }

    /**
     * Private acessor for the blockId
     */
    private _blockId: number = 0;

    public constructor(
        store: MeetingActiveFiltersService,
        categoryRepo: MotionCategoryControllerService,
        motionBlockRepo: MotionBlockControllerService,
        commentRepo: MotionCommentSectionControllerService,
        tagRepo: TagControllerService,
        workflowRepo: MotionWorkflowControllerService,
        protected override translate: TranslateService,
        operator: OperatorService,
        meetingSettingsService: MeetingSettingsService
    ) {
        super(
            store,
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
    protected override preFilter(viewMotions: ViewMotion[]): ViewMotion[] {
        return viewMotions.filter(motion => motion.block_id === this._blockId);
    }
}
