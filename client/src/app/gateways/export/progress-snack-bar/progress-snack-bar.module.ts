import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ProgressSnackBarComponent } from './components/progress-snack-bar/progress-snack-bar.component';
import { ProgressSnackBarServiceModule } from './services/progress-snack-bar-service.module';

@NgModule({
    declarations: [ProgressSnackBarComponent],
    imports: [
        CommonModule,
        ProgressSnackBarServiceModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [ProgressSnackBarServiceModule]
})
export class ProgressSnackBarModule {
    public static getComponent(): typeof ProgressSnackBarComponent {
        return ProgressSnackBarComponent;
    }
}
