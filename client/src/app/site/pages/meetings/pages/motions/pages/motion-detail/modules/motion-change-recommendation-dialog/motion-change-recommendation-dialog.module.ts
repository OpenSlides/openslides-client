import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionContentChangeRecommendationDialogComponent } from './components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import { MotionTitleChangeRecommendationDialogComponent } from './components/motion-title-change-recommendation-dialog/motion-title-change-recommendation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { EditorModule } from 'src/app/ui/modules/editor';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        EditorModule
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
