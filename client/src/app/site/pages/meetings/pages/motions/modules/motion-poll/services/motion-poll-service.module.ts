import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { MotionPollDialogComponent } from '../components/motion-poll-dialog/motion-poll-dialog.component';

@NgModule({ imports: [CommonModule, PollModule] })
export class MotionPollServiceModule {
    // public static getComponent(): typeof MotionPollDialogComponent {
    //     return MotionPollDialogComponent;
    // }
}
