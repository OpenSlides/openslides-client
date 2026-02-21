import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';

import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { ModifiedFinalVersionAction } from '../../../../services/motion-detail-view.service';

@Component({
    selector: `os-motion-final-version`,
    templateUrl: `./motion-final-version.component.html`,
    styleUrls: [`./motion-final-version.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionFinalVersionComponent extends BaseMotionDetailChildComponent {
    public readonly LineNumberingMode = LineNumberingMode;

    @Input()
    public formattedText: UnsafeHtml = ``;

    @Input()
    public lineNumberingMode: LineNumberingMode;

    public contentForm!: UntypedFormGroup;

    public isEditMode = false;

    /**
     * Show apply feedback for a short time
     */
    public applyFeedback = false;

    public constructor(
        protected override translate: TranslateService,
        private fb: UntypedFormBuilder
    ) {
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
        this.cd.markForCheck();
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

    public async applyModifiedFinalVersion(): Promise<void> {
        this.applyFeedback = true;
        setTimeout(() => {
            this.applyFeedback = false;
            this.cd.markForCheck();
        }, 2000);
        await this.repo.update(this.contentForm.value, this.motion).resolve();
        this.isEditMode = true;
    }

    private createForm(): UntypedFormGroup {
        return this.fb.group({
            modified_final_version: [``, Validators.required]
        });
    }

    private patchForm(): void {
        if (!this.contentForm) {
            this.contentForm = this.createForm();
        }

        this.contentForm.patchValue({
            modified_final_version: this.motion
                .services()
                .diff.formatOsCollidingChanges(
                    this.motion.modified_final_version,
                    this.motion.services().diff.formatOsCollidingChanges_wysiwyg_cb
                )
        });
    }
}
