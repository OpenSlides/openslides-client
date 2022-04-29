import { NgModule } from '@angular/core';
import { MotionBlockCommonServiceModule } from '../../../modules/motion-blocks/motion-block-common-service.module';
import { MotionCategoryCommonServiceModule } from '../../../modules/categories/motion-categorie-common-service.module';
import {
    MotionCommentCommonServiceModule,
    MotionWorkflowCommonServiceModule,
    TagCommonServiceModule
} from '../../../modules';

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
