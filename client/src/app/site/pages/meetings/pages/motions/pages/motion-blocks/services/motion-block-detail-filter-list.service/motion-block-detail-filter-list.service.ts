import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services';
import { MotionListFilterService } from '../../../../services/list/motion-list-filter.service';
import { MotionBlockServiceModule } from '../motion-block-service.module';
import { MotionCommentSectionControllerService } from '../../../../modules/comments/services';
import { TagControllerService } from '../../../../modules/tags/services';
import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'src/app/site/services/operator.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

@Injectable({
    providedIn: MotionBlockServiceModule
})
export class MotionBlockDetailFilterListService extends MotionListFilterService {
    /**
     * Private acessor for the blockId
     */
    private _blockId: number = 0;

    /**
     * setter for the blockId
     */
    public set blockId(id: number) {
        this._blockId = id;
    }

    public constructor(
        store: StorageService,
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
