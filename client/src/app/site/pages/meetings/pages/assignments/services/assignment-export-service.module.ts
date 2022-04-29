import { NgModule } from '@angular/core';
import { AssignmentPollModule } from '../modules/assignment-poll/assignment-poll.module';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

@NgModule({ imports: [MeetingPdfExportModule, AssignmentPollModule] })
export class AssignmentExportServiceModule {}
