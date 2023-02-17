import { NgModule } from '@angular/core';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { ParticipantCommonServiceModule } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-common-service.module';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

@NgModule({
    imports: [PollModule, ParticipantCommonServiceModule, MeetingPdfExportModule]
})
export class TopicPollServiceModule {}
