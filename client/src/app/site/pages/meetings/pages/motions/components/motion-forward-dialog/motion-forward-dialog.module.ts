import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { MeetingTimeModule } from 'src/app/ui/modules/meeting-time/meeting-time.module';

import { MotionForwardDialogComponent } from './components/motion-forward-dialog/motion-forward-dialog.component';

@NgModule({
    declarations: [MotionForwardDialogComponent],
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatButtonModule,
        MatRadioModule,
        MatTableModule,
        FormsModule,
        IconContainerModule,
        MeetingTimeModule,
        CommaSeparatedListingModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionForwardDialogModule {
    public static getComponent(): typeof MotionForwardDialogComponent {
        return MotionForwardDialogComponent;
    }
}
