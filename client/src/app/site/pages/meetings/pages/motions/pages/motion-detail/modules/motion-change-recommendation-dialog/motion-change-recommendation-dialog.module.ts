import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatRadioModule } from '@angular/material/radio';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { EditorModule } from 'src/app/ui/modules/editor';

import { MotionContentChangeRecommendationDialogComponent } from './components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import { MotionTitleChangeRecommendationDialogComponent } from './components/motion-title-change-recommendation-dialog/motion-title-change-recommendation-dialog.component';

@NgModule({
    declarations: [MotionContentChangeRecommendationDialogComponent, MotionTitleChangeRecommendationDialogComponent],
    imports: [
        CommonModule,
        MatInputModule,
        MatDialogModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatRadioModule,
        MatButtonModule,
        EditorModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionChangeRecommendationDialogModule {
    public static getTitleChangeRecommendationDialog(): typeof MotionTitleChangeRecommendationDialogComponent {
        return MotionTitleChangeRecommendationDialogComponent;
    }

    public static getContentChangeRecommendationDialog(): typeof MotionContentChangeRecommendationDialogComponent {
        return MotionContentChangeRecommendationDialogComponent;
    }
}
