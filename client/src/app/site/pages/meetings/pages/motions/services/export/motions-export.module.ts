import { NgModule } from '@angular/core';
import { MotionCommentCommonServiceModule, MotionStatuteParagraphServiceModule } from '../../modules';
import { MotionsCommonServiceModule } from '../common/motions-service.module';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';

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
