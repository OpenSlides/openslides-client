import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSnackBarComponent } from './components/progress-snack-bar/progress-snack-bar.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ProgressSnackBarServiceModule } from './services/progress-snack-bar-service.module';
import { MatButtonModule } from '@angular/material/button';

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
