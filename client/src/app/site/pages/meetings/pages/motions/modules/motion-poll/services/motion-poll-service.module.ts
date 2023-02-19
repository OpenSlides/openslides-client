import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

@NgModule({ imports: [CommonModule, PollModule, MeetingPdfExportModule] })
export class MotionPollServiceModule {
    // public static getComponent(): typeof MotionPollDialogComponent {
    //     return MotionPollDialogComponent;
    // }
}
