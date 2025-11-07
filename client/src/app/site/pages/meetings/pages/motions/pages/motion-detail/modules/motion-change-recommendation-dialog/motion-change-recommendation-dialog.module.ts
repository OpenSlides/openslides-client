import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
        MatIconModule,
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
