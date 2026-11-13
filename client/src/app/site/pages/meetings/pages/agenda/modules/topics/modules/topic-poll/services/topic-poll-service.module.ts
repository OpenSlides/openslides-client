import { NgModule } from '@angular/core';
import { PollModule } from '@app/site/pages/meetings/modules/poll';
import { ParticipantCommonServiceModule } from '@app/site/pages/meetings/pages/participants/services/common/participant-common-service.module';

@NgModule({
    imports: [PollModule, ParticipantCommonServiceModule]
})
export class TopicPollServiceModule {}
