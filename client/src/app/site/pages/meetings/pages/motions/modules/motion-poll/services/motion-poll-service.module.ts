import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';

@NgModule({ imports: [CommonModule, PollModule] })
export class MotionPollServiceModule {
    // public static getComponent(): typeof MotionPollDialogComponent {
    //     return MotionPollDialogComponent;
    // }
}
