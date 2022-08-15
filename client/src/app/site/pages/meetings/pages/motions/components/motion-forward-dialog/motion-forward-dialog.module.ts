import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { PipesModule } from 'src/app/ui/pipes';

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
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionForwardDialogModule {
    public static getComponent(): typeof MotionForwardDialogComponent {
        return MotionForwardDialogComponent;
    }
}
