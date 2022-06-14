import { NgModule } from '@angular/core';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

@NgModule({
    imports: [MotionPollModule, MeetingPdfExportModule]
})
export class MotionsExportModule {}
