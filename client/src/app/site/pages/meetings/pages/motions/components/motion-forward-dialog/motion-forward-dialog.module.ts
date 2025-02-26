import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { CommaSeparatedListingComponent } from 'src/app/ui/modules/comma-separated-listing';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { MeetingTimeComponent } from 'src/app/ui/modules/meeting-time/meeting-time.component';

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
        IconContainerComponent,
        MeetingTimeComponent,
        CommaSeparatedListingComponent,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionForwardDialogModule {
    public static getComponent(): typeof MotionForwardDialogComponent {
        return MotionForwardDialogComponent;
    }
}
