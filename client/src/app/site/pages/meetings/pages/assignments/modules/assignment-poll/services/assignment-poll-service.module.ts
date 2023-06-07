import { NgModule } from '@angular/core';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

import { ParticipantCommonServiceModule } from '../../../../participants/services/common/participant-common-service.module';

@NgModule({ imports: [PollModule, ParticipantCommonServiceModule, MeetingPdfExportModule] })
export class AssignmentPollServiceModule {}
