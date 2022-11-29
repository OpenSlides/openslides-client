import { Component, Input, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';

import { MotionDiffService } from '../../../../modules/change-recommendations/services';
import { BaseMotionDetailChildComponent } from '../../base/base-motion-detail-child.component';
import { MotionDetailServiceCollectorService } from '../../services/motion-detail-service-collector.service/motion-detail-service-collector.service';
import { ModifiedFinalVersionAction } from '../../services/motion-detail-view.service';

@Component({
    selector: `os-motion-final-version`,
    templateUrl: `./motion-final-version.component.html`,
    styleUrls: [`./motion-final-version.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MotionFinalVersionComponent extends BaseMotionDetailChildComponent {
    @Input()
    public formattedText: UnsafeHtml = ``;

    public contentForm!: UntypedFormGroup;

    public isEditMode = false;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        motionServiceCollector: MotionDetailServiceCollectorService,
        private diffService: MotionDiffService,
        private fb: UntypedFormBuilder
    ) {
        super(componentServiceCollector, translate, motionServiceCollector);
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
            modified_final_version: this.diffService.formatOsCollidingChanges(
                this.motion.modified_final_version,
                this.diffService.formatOsCollidingChanges_wysiwyg_cb
            )
        });
    }
}
