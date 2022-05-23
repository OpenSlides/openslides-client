import { NgModule } from '@angular/core';

import {
    MotionCommentCommonServiceModule,
    MotionWorkflowCommonServiceModule,
    TagCommonServiceModule
} from '../../../modules';
import { MotionCategoryCommonServiceModule } from '../../../modules/categories/motion-categorie-common-service.module';
import { MotionBlockCommonServiceModule } from '../../../modules/motion-blocks/motion-block-common-service.module';

@NgModule({
    imports: [
        MotionBlockCommonServiceModule,
        MotionCategoryCommonServiceModule,
        TagCommonServiceModule,
        MotionWorkflowCommonServiceModule,
        MotionCommentCommonServiceModule
    ]
})
export class MotionBlockServiceModule {}
