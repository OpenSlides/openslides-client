import { NgModule } from '@angular/core';
import { PollModule } from '@app/site/pages/meetings/modules/poll';
import { MeetingExportModule } from '@app/site/pages/meetings/services/export';

import { ParticipantCommonServiceModule } from '../../../../participants/services/common/participant-common-service.module';

@NgModule({ imports: [PollModule, ParticipantCommonServiceModule, MeetingExportModule] })
export class AssignmentPollServiceModule {}
