import { Component, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';

import {
    BaseChangeRecommendationData,
    BaseChangeRecommendationDialogComponent
} from '../../base/base-change-recommendation-dialog.component';

/**
 * Data that needs to be provided to the MotionTitleChangeRecommendationComponent dialog
 */
export interface MotionTitleChangeRecommendationDialogComponentData extends BaseChangeRecommendationData {}

/**
 * The dialog for creating and editing title change recommendations from within the os-motion-detail-component.
 *
 * @example
 * ```ts
 * const data: MotionTitleChangeRecommendationDialogComponentData = {
 *     editChangeRecommendation: false,
 *     newChangeRecommendation: true,
 *     changeReco: this.changeRecommendation,
 * };
 * this.dialogService.open(MotionTitleChangeRecommendationDialogComponent, {
 *      height: '400px',
 *      width: '600px',
 *      data: data,
 * });
 * ```
 */
@Component({
    selector: `os-motion-title-change-recommendation-dialog`,
    templateUrl: `./motion-title-change-recommendation-dialog.component.html`,
    styleUrls: [`./motion-title-change-recommendation-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class MotionTitleChangeRecommendationDialogComponent extends BaseChangeRecommendationDialogComponent<MotionTitleChangeRecommendationDialogComponentData> {
    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    protected createForm(): void {
        this.contentForm = this.formBuilder.group({
            text: [this.changeReco?.text, Validators.required],
            public: [!this.changeReco?.internal]
        });
    }
}
