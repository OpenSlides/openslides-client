import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { fromUnixTime, getHours, getMinutes, isDate } from 'date-fns';
import { Permission } from 'src/app/domain/definitions/permission';
import { KeyOfType } from 'src/app/infrastructure/utils/keyof-type';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionControllerService } from '../../../../../../services/common/motion-controller.service';
import { ViewMotion } from '../../../../../../view-models';

@Component({
    selector: `os-motion-manage-timestamp`,
    templateUrl: `./motion-manage-timestamp.component.html`,
    styleUrls: [`./motion-manage-timestamp.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionManageTimestampComponent extends BaseUiComponent implements OnInit {
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

    public form: UntypedFormGroup;

    /**
     * Saves if the users edits the note.
     */
    public set isEditMode(value: boolean) {
        this._editMode = value;
    }

    public get isEditMode(): boolean {
        return this._editMode;
    }

    public get isEmpty(): boolean {
        return !this.motion[this.field];
    }

    public get canChangeMetadata(): boolean {
        return this._change_metadata;
    }

    private _editMode = false;
    private _change_metadata = false;

    private _motion!: ViewMotion;

    public constructor(
        private motionController: MotionControllerService,
        private fb: UntypedFormBuilder,
        private operator: OperatorService,
        private cd: ChangeDetectorRef
    ) {
        super();

        this.form = this.fb.group({
            date: [``],
            time: [``]
        });

        this.subscriptions.push(
            this.form.get(`date`).valueChanges.subscribe(currDate => {
                if (isDate(currDate) !== !!this.form.get(`time`).value) {
                    this.form.get(`time`).setValue(isDate(currDate) ? `00:00` : ``);
                }
            }),
            this.form.get(`time`).valueChanges.subscribe(currTime => {
                if (!!currTime !== isDate(this.form.get(`date`).value)) {
                    this.form.get(`date`).setValue(!!currTime ? new Date() : null);
                }
            })
        );
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.operator.permissionsObservable.subscribe(() => {
                this._change_metadata = this.operator.hasPerms(Permission.motionCanManageMetadata);
                this.cd.markForCheck();
            })
        );
    }

    public async onSave(): Promise<void> {
        const date: { date: Date | null; time: string } = this.form.value;
        const [hours, minutes, ..._] = date.time.split(`:`);
        if (date.date) {
            date.date.setHours(+hours, +minutes);
        }
        await this.motionController
            .update({ [this.field]: date.date ? Math.floor(date.date.getTime() / 1000) : null }, this.motion)
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
        const date = timestamp
            ? this.getTimes(timestamp)
            : {
                  date: ``,
                  time: ``
              };
        this.form.patchValue(date);
        this.isEditMode = true;
    }

    public getTimes(timestamp: number): { date: Date; time: string } {
        const date = fromUnixTime(timestamp);
        const time = getHours(date) + `:` + getMinutes(date);
        return { date, time };
    }

    public clearForm(): void {
        this.form.patchValue({
            date: ``,
            time: ``
        });
    }
}
