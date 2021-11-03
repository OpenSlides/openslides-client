import { Injectable } from '@angular/core';
import { MotionService } from 'app/core/repositories/motions/motion.service';
import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { MotionLineNumberingService } from 'app/core/repositories/motions/motion-line-numbering.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { MotionStatuteParagraphRepositoryService } from 'app/core/repositories/motions/motion-statute-paragraph-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';

import { MotionFormatService } from '../../services/motion-format.service';
import { MotionViewService } from './motion-view.service';

@Injectable({
    providedIn: `root`
})
export class MotionServiceCollectorService {
    public constructor(
        public changeRecoRepo: MotionChangeRecommendationRepositoryService,
        public userRepo: UserRepositoryService,
        public statuteRepo: MotionStatuteParagraphRepositoryService,
        public motionRepo: MotionRepositoryService,
        public workflowRepo: MotionWorkflowRepositoryService,
        public categoryRepo: MotionCategoryRepositoryService,
        public blockRepo: MotionBlockRepositoryService,
        public tagRepo: TagRepositoryService,
        public motionService: MotionService,
        public motionLineNumbering: MotionLineNumberingService,
        public motionViewService: MotionViewService,
        public motionFormatService: MotionFormatService
    ) {}
}
