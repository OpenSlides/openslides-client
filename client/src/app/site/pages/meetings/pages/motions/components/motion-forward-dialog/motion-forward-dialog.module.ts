import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
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
        FormsModule,
        IconContainerModule,
        MeetingTimeModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionForwardDialogModule {
    public static getComponent(): typeof MotionForwardDialogComponent {
        return MotionForwardDialogComponent;
    }
}
