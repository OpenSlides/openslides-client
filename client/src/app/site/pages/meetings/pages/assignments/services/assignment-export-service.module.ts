import { NgModule } from '@angular/core';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

import { AssignmentPollModule } from '../modules/assignment-poll/assignment-poll.module';

@NgModule({ imports: [MeetingPdfExportModule, AssignmentPollModule] })
export class AssignmentExportServiceModule {}
