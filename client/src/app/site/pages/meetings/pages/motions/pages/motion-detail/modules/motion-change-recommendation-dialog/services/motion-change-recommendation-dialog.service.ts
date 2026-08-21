import { inject, Service } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { infoDialogSettings, mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';

import {
    MotionContentChangeRecommendationDialogComponent,
    MotionContentChangeRecommendationDialogComponentData
} from '../components/motion-content-change-recommendation-dialog/motion-content-change-recommendation-dialog.component';
import {
    MotionTitleChangeRecommendationDialogComponent,
    MotionTitleChangeRecommendationDialogComponentData
} from '../components/motion-title-change-recommendation-dialog/motion-title-change-recommendation-dialog.component';

@Service()
export class MotionChangeRecommendationDialogService {
    private dialog = inject(MatDialog);

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
