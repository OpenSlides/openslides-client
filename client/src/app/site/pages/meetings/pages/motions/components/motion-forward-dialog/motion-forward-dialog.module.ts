import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionForwardDialogComponent } from './components/motion-forward-dialog/motion-forward-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [MotionForwardDialogComponent],
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatButtonModule,
        FormsModule,
        IconContainerModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionForwardDialogModule {
    public static getComponent(): typeof MotionForwardDialogComponent {
        return MotionForwardDialogComponent;
    }
}
