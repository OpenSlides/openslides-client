import { Directive, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MotionChangeRecommendation } from 'src/app/domain/models/motions/motion-change-recommendation';

import { MotionChangeRecommendationControllerService } from '../../../../../modules/change-recommendations/services/motion-change-recommendation-controller.service/motion-change-recommendation-controller.service';

export interface BaseChangeRecommendationData {
    editChangeRecommendation: boolean;
    newChangeRecommendation: boolean;
    changeRecommendation: Partial<MotionChangeRecommendation> | MotionChangeRecommendation | null;
}

@Directive()
export abstract class BaseChangeRecommendationDialogComponent<T extends BaseChangeRecommendationData> {
    /**
     * Determine if the change recommendation is edited
     */
    public editReco = false;

    /**
     * Determine if the change recommendation is new
     */
    public newReco = false;

    /**
     * The change recommendation
     */
    public changeReco: Partial<MotionChangeRecommendation> | MotionChangeRecommendation | null = null;

    /**
     * Change recommendation content.
     */
    public contentForm!: UntypedFormGroup;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: T,
        protected formBuilder: UntypedFormBuilder,
        protected repo: MotionChangeRecommendationControllerService,
        protected dialogRef: MatDialogRef<BaseChangeRecommendationDialogComponent<T>>
    ) {
        this.initializeDialogData();
        this.createForm();
    }

    public async submitChanges(): Promise<void> {
        this.saveChangeRecommendation();
    }

    protected initializeDialogData(): void {
        this.editReco = this.data.editChangeRecommendation;
        this.newReco = this.data.newChangeRecommendation;
        this.changeReco = this.data.changeRecommendation;
    }

    protected async createChangeRecommendation(): Promise<void> {
        await this.repo.create({
            ...this.changeReco,
            ...this.contentForm.value,
            internal: !this.contentForm.value.public
        });
    }

    private async saveChangeRecommendation(): Promise<void> {
        if (this.newReco) {
            await this.handleRequest(this.createChangeRecommendation());
        } else {
            await this.handleRequest(this.updateChangeRecommmendation());
        }
        this.dialogRef.close();
    }

    private async updateChangeRecommmendation(): Promise<void> {
        await this.repo.update(this.contentForm.value, this.changeReco as MotionChangeRecommendation);
    }

    private handleRequest(request: Promise<any>): Promise<void> {
        return request;
    }

    protected abstract createForm(): void;
}
