import { Component } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { _ } from '@ngx-translate/core';
import { ModificationType } from 'src/app/domain/models/motions/motions.constants';
import { isNumberRange } from 'src/app/infrastructure/utils/validators';
import { ParentErrorStateMatcher } from 'src/app/ui/modules/search-selector/validators';

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
    styleUrls: [`./motion-content-change-recommendation-dialog.component.scss`],
    standalone: false
})
export class MotionContentChangeRecommendationDialogComponent extends BaseChangeRecommendationDialogComponent<MotionContentChangeRecommendationDialogComponentData> {
    public parentErrorStateMatcher = new ParentErrorStateMatcher();
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

    public editLineRange = false;

    public toggleLineRange(): void {
        this.editLineRange = !this.editLineRange;
    }

    protected checkLineRangeValidator(): ValidatorFn {
        return (formControl: AbstractControl): Record<string, any> | null => {
            const line_from = formControl.get(`line_from`)!.value;
            const line_to = formControl.get(`line_to`)!.value;
            if (!this.repo.checkLineRanges(this.changeReco.id, line_from, line_to)) {
                return { line_check_error: true };
            }
            return null;
        };
    }

    /**
     * Creates the forms for the Motion and the MotionVersion
     */
    protected createForm(): void {
        this.contentForm = this.formBuilder.group(
            {
                text: [this.changeReco?.text, Validators.required],
                type: [this.changeReco?.type, Validators.required],
                public: [!this.changeReco?.internal],
                line_to: [this.changeReco?.line_to, [Validators.required, Validators.pattern(`[0-9]*`)]],
                line_from: [
                    this.changeReco?.line_from,
                    [Validators.required, Validators.min(0), Validators.pattern(`[0-9]*`)]
                ]
            },
            {
                validators: [isNumberRange(`line_from`, `line_to`, `range_error`), this.checkLineRangeValidator()]
            }
        );
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
