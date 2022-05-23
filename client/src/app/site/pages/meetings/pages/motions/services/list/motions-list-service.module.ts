import { NgModule } from '@angular/core';

import {
    MotionBlockCommonServiceModule,
    MotionCommentCommonServiceModule,
    MotionWorkflowCommonServiceModule,
    TagCommonServiceModule
} from '../../modules';
import { MotionCategoryCommonServiceModule } from '../../modules/categories/motion-categorie-common-service.module';

@NgModule({
    imports: [
        MotionBlockCommonServiceModule,
        MotionCategoryCommonServiceModule,
        MotionWorkflowCommonServiceModule,
        MotionCommentCommonServiceModule,
        TagCommonServiceModule
    ]
})
export class MotionsListServiceModule {}
