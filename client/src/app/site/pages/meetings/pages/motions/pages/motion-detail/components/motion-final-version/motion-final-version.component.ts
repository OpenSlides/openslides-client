import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UnsafeHtml } from 'src/app/domain/definitions/key-types';

import { BaseMotionDetailChildComponent } from '../../base/base-motion-detail-child.component';
import { ModifiedFinalVersionAction } from '../../services/motion-detail-view.service';

@Component({
    selector: `os-motion-final-version`,
    templateUrl: `./motion-final-version.component.html`,
    styleUrls: [`./motion-final-version.component.scss`]
})
export class MotionFinalVersionComponent extends BaseMotionDetailChildComponent {
    @Input()
    public formattedText: UnsafeHtml = ``;

    public contentForm!: FormGroup;

    public isEditMode = false;

    public constructor(private fb: FormBuilder) {
        super();
    }

    protected override getSubscriptions(): Subscription[] {
        return [
            this.viewService.modifiedFinalVersionActionSubject.subscribe(state => this.performActionByState(state))
        ];
    }

    private performActionByState(state: ModifiedFinalVersionAction): void {
        switch (state) {
            case ModifiedFinalVersionAction.CANCEL:
                this.leaveEditMode();
                break;
            case ModifiedFinalVersionAction.EDIT:
                this.enterEditMode();
                break;
            case ModifiedFinalVersionAction.SAVE:
                this.saveModifiedFinalVersion();
                break;
        }
    }

    private enterEditMode(): void {
        this.patchForm();
        this.isEditMode = true;
    }

    private leaveEditMode(): void {
        this.isEditMode = false;
    }

    private async saveModifiedFinalVersion(): Promise<void> {
        await this.repo.update(this.contentForm.value, this.motion).resolve();
        this.leaveEditMode();
    }

    private createForm(): FormGroup {
        return this.fb.group({
            modified_final_version: [``, Validators.required]
        });
    }

    private patchForm(): void {
        if (!this.contentForm) {
            this.contentForm = this.createForm();
        }
        this.contentForm.patchValue({
            modified_final_version: this.motion.modified_final_version
        });
    }
}
