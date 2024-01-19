import { Component, Input } from '@angular/core';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { RawUser } from 'src/app/gateways/repositories/users';
import { UserSelectionData } from 'src/app/site/pages/meetings/modules/participant-search-selector';
import { ViewMotion as ViewMeetingUser, ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-motion-manage-single-participant-field`,
    templateUrl: `./motion-manage-single-participant-field.component.html`,
    styleUrls: [`./motion-manage-single-participant-field.component.scss`]
})
export class MotionManageSingleParticipantFieldComponent extends BaseUiComponent {
    public nonSelectableUserIds: number[] = [];

    @Input()
    public set motion(motion: ViewMotion) {
        this._motion = motion;
        this.value = this.motion[this.field];
    }

    public get motion(): ViewMotion {
        return this._motion;
    }

    @Input()
    public field: Required<ViewMeetingUser>[keyof ViewMotion] & string;

    @Input()
    public title: string;

    @Input()
    public placeholder: string;

    public isEditMode = false;

    public value: RawUser | null = null;

    private _motion!: ViewMotion;

    public constructor(
        private userRepository: ParticipantControllerService,
        private motionRepository: MotionRepositoryService
    ) {
        super();
    }

    public setEditor(data: UserSelectionData): void {
        this.nonSelectableUserIds = [];
        this.value = data.user ?? this.userRepository.getViewModel(data.userId);
        console.log(this.value);
    }

    public async onSave(): Promise<void> {
        this.save();
        this.isEditMode = false;
    }

    public onEdit(): void {
        console.log(this.motion[this.field]);
        this.isEditMode = true;
        this.value = this.motion[this.field];
    }

    public onCancel(): void {
        this.isEditMode = false;
    }

    public onClear(): void {
        this.value = null;
        this.save();
        this.isEditMode = false;
    }

    private async save(): Promise<void> {
        const idField = `${this.field}_id`;
        const userId = this.value?.id ?? null;
        await this.motionRepository.update({ [idField]: userId }, this.motion).resolve();
    }
}
