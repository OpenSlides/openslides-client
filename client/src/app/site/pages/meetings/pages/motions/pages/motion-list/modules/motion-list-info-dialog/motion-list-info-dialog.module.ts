import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionListInfoDialogComponent } from './components/motion-list-info-dialog/motion-list-info-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/ui/directives';

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
