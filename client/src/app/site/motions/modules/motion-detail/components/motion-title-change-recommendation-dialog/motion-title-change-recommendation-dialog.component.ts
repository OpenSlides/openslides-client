import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';

import {
    BaseChangeRecommendationData,
    BaseChangeRecommendationDialogComponent
} from '../base/base-change-recommendation-dialog.component';

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
    selector: `os-title-motion-change-recommendation-dialog`,
    templateUrl: `./motion-title-change-recommendation-dialog.component.html`,
    styleUrls: [`./motion-title-change-recommendation-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MotionTitleChangeRecommendationDialogComponent extends BaseChangeRecommendationDialogComponent<MotionTitleChangeRecommendationDialogComponentData> {
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: MotionTitleChangeRecommendationDialogComponentData,
        formBuilder: FormBuilder,
        repo: MotionChangeRecommendationRepositoryService,
        dialogRef: MatDialogRef<MotionTitleChangeRecommendationDialogComponent>
    ) {
        super(componentServiceCollector, translate, data, formBuilder, repo, dialogRef);
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    protected createForm(): void {
        this.contentForm = this.formBuilder.group({
            text: [this.changeReco.text, Validators.required],
            public: [!this.changeReco.internal]
        });
    }
}
