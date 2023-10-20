import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { infoDialogSettings, mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';

import {
    MotionContentChangeRecommendationDialogComponent,
    MotionContentChangeRecommendationDialogComponentData
} from '../components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import {
    MotionTitleChangeRecommendationDialogComponent,
    MotionTitleChangeRecommendationDialogComponentData
} from '../components/motion-title-change-recommendation-dialog/motion-title-change-recommendation-dialog.component';
import { MotionChangeRecommendationDialogModule } from '../motion-change-recommendation-dialog.module';

@Injectable({
    providedIn: MotionChangeRecommendationDialogModule
})
export class MotionChangeRecommendationDialogService {
    public constructor(private dialog: MatDialog) {}

    public async openTitleChangeRecommendationDialog(
        data: MotionTitleChangeRecommendationDialogComponentData
    ): Promise<MatDialogRef<MotionTitleChangeRecommendationDialogComponent, void>> {
        const module = await import(`../motion-change-recommendation-dialog.module`).then(
            m => m.MotionChangeRecommendationDialogModule
        );
        return this.dialog.open(module.getTitleChangeRecommendationDialog(), { ...infoDialogSettings, data });
    }

    public async openContentChangeRecommendationDialog(
        data: MotionContentChangeRecommendationDialogComponentData
    ): Promise<MatDialogRef<MotionContentChangeRecommendationDialogComponent, void>> {
        const module = await import(`../motion-change-recommendation-dialog.module`).then(
            m => m.MotionChangeRecommendationDialogModule
        );
        return this.dialog.open(module.getContentChangeRecommendationDialog(), { ...mediumDialogSettings, data });
    }
}
