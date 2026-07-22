import { NgModule } from '@angular/core';
import { MotionPollModule } from '@app/site/pages/meetings/pages/motions/modules/motion-poll';
import { MeetingExportModule } from '@app/site/pages/meetings/services/export';

@NgModule({
    imports: [MotionPollModule, MeetingExportModule]
})
export class MotionsExportModule {}
