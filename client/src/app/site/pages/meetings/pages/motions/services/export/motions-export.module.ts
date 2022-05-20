import { NgModule } from '@angular/core';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

import { MotionCommentCommonServiceModule, MotionStatuteParagraphServiceModule } from '../../modules';
import { MotionsCommonServiceModule } from '../common/motions-service.module';

@NgModule({
    imports: [
        MotionsCommonServiceModule,
        MotionCommentCommonServiceModule,
        MotionStatuteParagraphServiceModule,
        MotionPollModule,
        MeetingPdfExportModule
    ]
})
export class MotionsExportModule {}
