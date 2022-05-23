import { NgModule } from '@angular/core';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';

import { ParticipantCommonServiceModule } from '../../../../participants/services/common/participant-common-service.module';

@NgModule({ imports: [PollModule, ParticipantCommonServiceModule] })
export class AssignmentPollServiceModule {}
