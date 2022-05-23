import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

@NgModule({
    declarations: [],
    imports: [CommonModule, MeetingPdfExportModule]
})
export class ParticipantExportModule {}
