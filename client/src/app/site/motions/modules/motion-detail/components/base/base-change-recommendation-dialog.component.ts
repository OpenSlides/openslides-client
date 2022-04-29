import { Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MotionChangeRecommendationAction } from 'app/core/actions/motion-change-recommendation-action';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MotionChangeRecommendation } from 'app/shared/models/motions/motion-change-recommendation';
import { BaseComponent } from 'app/site/base/components/base.component';

export interface BaseChangeRecommendationData {
    editChangeRecommendation: boolean;
    newChangeRecommendation: boolean;
    changeRecommendation: Partial<MotionChangeRecommendationAction.CreatePayload> | MotionChangeRecommendation;
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
    public changeReco: Partial<MotionChangeRecommendationAction.CreatePayload> | MotionChangeRecommendation;

    /**
     * Change recommendation content.
     */
    public contentForm: FormGroup;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: T,
        protected formBuilder: FormBuilder,
        protected repo: MotionChangeRecommendationRepositoryService,
        protected dialogRef: MatDialogRef<BaseChangeRecommendationDialogComponent<T>>
    ) {
        super(componentServiceCollector, translate);

        this.initializeDialogData();
        this.createForm();
    }

    public async submitChanges(): Promise<void> {
        this.saveChangeRecommendation();
    }

    public getTinyMceSettings(): object {
        return {
            toolbar: `undo redo | bold italic underline strikethrough
            | removeformat | bullist numlist | outdent indent | link charmap code`
        };
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
