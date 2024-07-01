import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { ModificationType } from 'src/app/domain/models/motions/motions.constants';

import { LineRange } from '../../../../../../definitions/index';
import {
    BaseChangeRecommendationData,
    BaseChangeRecommendationDialogComponent
} from '../../base/base-change-recommendation-dialog.component';

/**
 * Data that needs to be provided to the MotionChangeRecommendationComponent dialog
 */
export interface MotionContentChangeRecommendationDialogComponentData extends BaseChangeRecommendationData {
    lineRange: LineRange;
    firstLine: number;
}

/**
 * The dialog for creating and editing change recommendations from within the os-motion-detail-component.
 *
 * @example
 * ```ts
 * const data: MotionChangeRecommendationDialogComponentData = {
 *     editChangeRecommendation: false,
 *     newChangeRecommendation: true,
 *     lineRange: lineRange,
 *     changeReco: this.changeRecommendation,
 * };
 * this.dialogService.open(MotionChangeRecommendationDialogComponent, {
 *      height: '400px',
 *      width: '600px',
 *      data: data,
 * });
 * ```
 *
 */
@Component({
    selector: `os-motion-content-change-recommendation-dialog`,
    templateUrl: `./motion-content-change-recommendation-dialog.component.html`,
    styleUrls: [`./motion-content-change-recommendation-dialog.component.scss`]
})
export class MotionContentChangeRecommendationDialogComponent extends BaseChangeRecommendationDialogComponent<MotionContentChangeRecommendationDialogComponentData> {
    /**
     * The replacement types for the radio group
     * @TODO translate
     */
    public readonly replacementTypes = [
        {
            value: ModificationType.TYPE_REPLACEMENT,
            title: _(`Replacement`)
        },
        {
            value: ModificationType.TYPE_INSERTION,
            title: _(`Insertion`)
        },
        {
            value: ModificationType.TYPE_DELETION,
            title: _(`Deletion`)
        }
    ];

    /**
     * The line range affected by this change recommendation
     */
    public lineRange!: LineRange;

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    protected createForm(): void {
        this.contentForm = this.formBuilder.group({
            text: [this.changeReco?.text, Validators.required],
            type: [this.changeReco?.type, Validators.required],
            public: [!this.changeReco?.internal]
        });
    }

    protected override initializeDialogData(): void {
        super.initializeDialogData();
        this.lineRange = this.data.lineRange;
    }

    protected override async createChangeRecommendation(): Promise<void> {
        await this.repo.create(
            { ...this.changeReco, ...this.contentForm.value, internal: !this.contentForm.value.public },
            this.data.firstLine
        );
    }
}
