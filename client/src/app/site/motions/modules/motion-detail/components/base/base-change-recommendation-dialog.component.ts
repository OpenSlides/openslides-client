import { Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';

export interface BaseChangeRecommendationData {
    editChangeRecommendation: boolean;
    newChangeRecommendation: boolean;
    changeRecommendation: ViewMotionChangeRecommendation;
}

export abstract class BaseChangeRecommendationDialogComponent<
    T extends BaseChangeRecommendationData
> extends BaseComponent {
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
    public changeReco: ViewMotionChangeRecommendation;

    /**
     * Change recommendation content.
     */
    public contentForm: FormGroup;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        @Inject(MAT_DIALOG_DATA) public data: T,
        protected formBuilder: FormBuilder,
        protected repo: MotionChangeRecommendationRepositoryService,
        protected dialogRef: MatDialogRef<BaseChangeRecommendationDialogComponent<T>>
    ) {
        super(componentServiceCollector);

        this.initializeDialogData();
        this.createForm();
    }

    public async submitChanges(): Promise<void> {
        // this.applyChangesOnChangeRecommendation();
        this.saveChangeRecommendation();
    }

    protected initializeDialogData(): void {
        this.editReco = this.data.editChangeRecommendation;
        this.newReco = this.data.newChangeRecommendation;
        this.changeReco = this.data.changeRecommendation;

        this.tinyMceSettings.toolbar = `undo redo | bold italic underline strikethrough
            | removeformat | bullist numlist | outdent indent | link charmap code`;
    }

    private applyChangesOnChangeRecommendation(): void {
        this.changeReco.updateChangeReco(
            this.contentForm.controls.diffType.value,
            this.contentForm.controls.text.value,
            !this.contentForm.controls.public.value
        );
    }

    private async saveChangeRecommendation(): Promise<void> {
        if (this.newReco) {
            await this.handleRequest(this.createChangeRecommendation());
        } else {
            await this.handleRequest(this.updateChangeRecommmendation());
        }
        this.dialogRef.close();
    }

    private async createChangeRecommendation(): Promise<void> {
        console.log('create changereco', this.changeReco);
        await this.repo.create(this.changeReco);
    }

    private async updateChangeRecommmendation(): Promise<void> {
        console.log('update changereco', this.changeReco);
        await this.repo.update(this.changeReco.changeRecommendation, this.changeReco);
    }

    private handleRequest(request: Promise<any>): Promise<void> {
        // return request.catch(this.raiseError);
        return request;
    }

    protected abstract createForm(): void;
}
