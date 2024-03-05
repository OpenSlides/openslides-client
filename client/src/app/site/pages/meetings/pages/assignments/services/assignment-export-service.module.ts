import { NgModule } from '@angular/core';
import { MeetingExportModule } from 'src/app/site/pages/meetings/services/export';

import { AssignmentPollModule } from '../modules/assignment-poll/assignment-poll.module';

@NgModule({ imports: [MeetingExportModule, AssignmentPollModule] })
export class AssignmentExportServiceModule {}
