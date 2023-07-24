import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { auditTime } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ExportFileFormat } from 'src/app/site/pages/meetings/pages/motions/services/export/definitions';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { ExportDialogSettings, ExportInfoChoiceType } from '../../services';

interface Choice<ExportInfo> {
    label?: string;
    perms?: Permission;
    disableWhen?: { otherValue: ExportInfo[keyof ExportInfo]; checked: boolean }[];
    disableForFormat?: ExportFileFormat[];
    disabled?: boolean;
    changeStateForFormat?: { format: ExportFileFormat[]; value: boolean }[];
}

type ChoiceMap<ExportInfo> = Map<ExportInfoChoiceType<ExportInfo[keyof ExportInfo]>, Choice<ExportInfo>>;

interface ExportInfoTableData<ExportInfo> {
    key: string;
    label?: string;
    weight: number;
    multiple: boolean;
    offState?: ExportInfoChoiceType<ExportInfo[keyof ExportInfo]>;
    disableForFormat?: ExportFileFormat[];
    choices: ChoiceMap<ExportInfo>;
}

@Component({
    selector: `os-export-dialog`,
    templateUrl: `./export-dialog.component.html`,
    styleUrls: [`./export-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ExportDialogComponent<T extends BaseViewModel, ExportInfo extends { format?: ExportFileFormat }>
    extends BaseUiComponent
    implements OnInit
{
    public readonly permission = Permission;

    /**
     * The form that contains the export information.
     */
    public exportForm!: UntypedFormGroup;

    public settings: ExportInfoTableData<ExportInfo>[] = [];

    private format: ExportFileFormat;

    /**
     * Constructor
     * Sets the default values for the lineNumberingMode and changeRecoMode and creates the form.
     * This uses "instant" over observables to prevent on-fly-changes by auto update while
     * the dialog is open.
     */
    public constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            data: T[];
            settings: ExportDialogSettings<ExportInfo>;
            defaults: ExportInfo;
            storageKey: string;
        },
        public formBuilder: UntypedFormBuilder,
        public dialogRef: MatDialogRef<ExportDialogComponent<T, ExportInfo>>,
        private store: StorageService
    ) {
        super();

        this.settings = Object.keys(data.settings.settings)
            .map(key => ({
                ...data.settings.settings[key as keyof ExportInfo],
                key
            }))
            .sort((a, b) => a.weight - b.weight);
        this.createForm();
    }

    /**
     * Init.
     * Observes the form for changes to react dynamically
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.exportForm.valueChanges.pipe(auditTime(500)).subscribe((value: ExportInfo) => {
                this.store.set(`${this.data.storageKey}_export_selection`, value);
            }),

            this.exportForm
                .get(`format`)!
                .valueChanges.subscribe((value: ExportFileFormat) => this.onFormatChange(value))
        );
    }

    public getSettingTitle(setting: ExportInfoTableData<ExportInfo>): string {
        return setting.label ?? String(setting.key).charAt(0).toLocaleUpperCase() + String(setting.key).slice(1);
    }

    public getChoiceTitle(choice: Choice<ExportInfo>, key: ExportInfoChoiceType<ExportInfo[keyof ExportInfo]>): string {
        return choice.label ?? String(key).charAt(0).toLocaleUpperCase() + String(key).slice(1);
    }

    /**
     * React to changes on the file format
     * @param format
     */
    private onFormatChange(format: ExportFileFormat): void {
        this.format = format;
        this.updateDisabled();
    }

    public onChange(event: MatButtonToggleChange, row: ExportInfoTableData<ExportInfo>): void {
        this.updateDisabled(row);
        // if (event.value.includes(MOTION_PDF_OPTIONS.ContinuousText)) {
        //     this.tocButton.checked = false;
        //     this.addBreaksButton.checked = false;
        // }
    }

    /**
     * Just close the dialog
     */
    public onCloseClick(): void {
        this.dialogRef.close();
    }

    private updateDisabled(row?: ExportInfoTableData<ExportInfo>) {
        for (let setting of row ? [row] : this.settings) {
            const control = this.exportForm.get(setting.key);
            if (setting.disableForFormat?.includes(this.format)) {
                control.setValue(setting.multiple ? [] : null);
                control.disable();
            } else if (control.disabled) {
                control.enable();
                control.setValue(this.data.defaults[setting.key]);
            }
            for (let choiceKey of setting.choices.keys()) {
                const choice = setting.choices.get(choiceKey);
                const value = control.value;
                const disabled = choice.disabled;
                choice.disabled =
                    choice.disableForFormat?.includes(this.format) ||
                    choice.disableWhen?.some(condition => {
                        return (
                            (Array.isArray(value)
                                ? value.includes(condition.otherValue)
                                : value === condition.otherValue) === condition.checked
                        );
                    });
                if (
                    choice.disabled &&
                    !disabled &&
                    (Array.isArray(value) ? value.includes(choiceKey) : value === choiceKey)
                ) {
                    control.setValue(
                        Array.isArray(value) ? value.filter(val => val !== choiceKey) : this.getOffState(setting.key)
                    );
                } else if (choice.disabled !== disabled) {
                    control.setValue(this.data.defaults[setting.key]);
                }
            }
        }
    }

    /**
     * Determine what "off" means in certain states
     *
     * @param control
     */
    private getOffState(control: string): ExportInfoChoiceType<ExportInfo[keyof ExportInfo]> | null {
        return this.settings.find(row => row.key === control)?.offState || null;
    }

    /**
     * Creates the form with default values
     */
    private createForm(): void {
        this.exportForm = this.formBuilder.group(this.settings.mapToObject(setting => ({ [setting.key]: [] })));

        // restore selection or set default
        this.store.get<ExportInfo>(`${this.data.storageKey}_export_selection`).then(restored => {
            if (restored) {
                this.exportForm.patchValue(restored);
            } else {
                this.exportForm.patchValue(this.data.defaults);
            }
        });
    }
}
