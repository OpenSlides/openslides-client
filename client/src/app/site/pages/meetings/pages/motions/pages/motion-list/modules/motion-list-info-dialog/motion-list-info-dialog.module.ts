import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { MotionListInfoDialogComponent } from './components/motion-list-info-dialog/motion-list-info-dialog.component';

@NgModule({
    declarations: [MotionListInfoDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDialogModule,
        MatButtonModule,
        OpenSlidesTranslationModule.forChild(),
        DirectivesModule
    ]
})
export class MotionListInfoDialogModule {
    public static getComponent(): typeof MotionListInfoDialogComponent {
        return MotionListInfoDialogComponent;
    }
}
