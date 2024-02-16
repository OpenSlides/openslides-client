import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { KeyOfType } from 'src/app/infrastructure/utils/keyof-type';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionControllerService } from '../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service';
import { ViewMotion } from '../../../../view-models';

@Component({
    selector: `os-motion-manage-timestamp`,
    templateUrl: `./motion-manage-timestamp.component.html`,
    styleUrls: [`./motion-manage-timestamp.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionManageTimestampComponent extends BaseUiComponent {
    public get motion(): ViewMotion {
        return this._motion;
    }

    @Input()
    public set motion(value: ViewMotion) {
        this._motion = value;
    }

    @Input()
    public field: KeyOfType<ViewMotion, number>;

    @Input()
    public title: string;

    public contentForm: UntypedFormControl;

    /**
     * Saves if the users edits the note.
     */
    public set isEditMode(value: boolean) {
        this._editMode = value;
    }

    public get isEditMode(): boolean {
        return this._editMode;
    }

    private _editMode = false;

    private _motion!: ViewMotion;

    public constructor(
        public perms: MotionPermissionService,
        private motionController: MotionControllerService,
        private fb: UntypedFormBuilder
    ) {
        super();

        this.contentForm = this.fb.control(null);
    }

    public async onSave(): Promise<void> {
        await this.motionController
            .update({ [this.field]: (this.contentForm.value as Date).getTime() / 1000 }, this.motion)
            .resolve();
        this.isEditMode = false;
    }

    /**
     * Close the edit view.
     */
    public onCancel(): void {
        this.isEditMode = false;
    }

    /**
     * Enter the edit mode and reset the form and the data.
     */
    public onEdit(): void {
        const timestamp = this.motion[this.field];
        const date = timestamp ? new Date(timestamp * 1000) : null;
        this.contentForm.setValue(date);
        this.isEditMode = true;
    }
}
