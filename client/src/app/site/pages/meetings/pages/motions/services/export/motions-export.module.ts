import { NgModule } from '@angular/core';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { MeetingExportModule } from 'src/app/site/pages/meetings/services/export';

@NgModule({
    imports: [MotionPollModule, MeetingExportModule]
})
export class MotionsExportModule {}
