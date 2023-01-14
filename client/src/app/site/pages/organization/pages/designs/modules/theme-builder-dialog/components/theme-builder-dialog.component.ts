import { AfterViewInit, Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Theme } from 'src/app/domain/models/theme/theme';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { ColorService } from 'src/app/site/services/color.service';
import { ThemeService } from 'src/app/site/services/theme.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

type ThemeBuilderDialogData = {
    [K in keyof Theme]?: string;
};

@Component({
    selector: `os-theme-builder-dialog`,
    templateUrl: `./theme-builder-dialog.component.html`,
    styleUrls: [`./theme-builder-dialog.component.scss`]
})
export class ThemeBuilderDialogComponent extends BaseUiComponent implements AfterViewInit {
    public paletteBuilderForm: UntypedFormGroup | null = null;

    public _paletteKeys: string[] = [`500`];
    private _themePalettes: ThemePalette[] = [`primary`, `accent`, `warn`];

    private _currentPalettes: { [formControlName: string]: string } = {};

    public constructor(
        private dialogRef: MatDialogRef<ThemeBuilderDialogComponent>,
        private fb: UntypedFormBuilder,
        private colorService: ColorService,
        private themeService: ThemeService,
        private organizationService: OrganizationService,
        @Inject(MAT_DIALOG_DATA) private data: ThemeBuilderDialogData
    ) {
        super();
    }

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.paletteBuilderForm = this.createForm();
            for (const paletteName of this._themePalettes) {
                const formUpdate: any = this.data ?? this.createFormUpdate(paletteName);
                this.paletteBuilderForm.patchValue(formUpdate);
                Object.keys(formUpdate).forEach(key => (this._currentPalettes[key] = formUpdate[key])); // Set the initial values
            }
            this.paletteBuilderForm.patchValue({ name: this.getNextThemeName() });
        });
    }

    public resetField(formControlName: string | ThemePalette): void {
        if (formControlName === `primary` || formControlName === `accent` || formControlName === `warn`) {
            this.paletteBuilderForm!.patchValue(this.createFormUpdate(formControlName));
        } else {
            this.paletteBuilderForm!.patchValue({
                [formControlName as string]: this._currentPalettes[formControlName as string]
            });
        }
    }

    public onClose(): void {
        for (const palette of this._themePalettes) {
            this.resetField(palette);
        }
        this.dialogRef.close(null);
    }

    public onConfirm(): void {
        this.dialogRef.close({
            ...this.paletteBuilderForm!.value
        });
    }

    public createFormControlName(paletteName: ThemePalette, paletteKey: string): string {
        return `${paletteName}_${paletteKey}`;
    }

    private createForm(): UntypedFormGroup {
        const formGroup: { [paletteKey: string]: any[] } = {
            name: [``, Validators.required]
        };
        for (const paletteName of this._themePalettes) {
            for (const paletteKey of this._paletteKeys) {
                formGroup[`${paletteName}_${paletteKey}`] = [``];
            }
        }
        return this.fb.group(formGroup);
    }

    // Combine createForm with createFormUpdate
    private createFormUpdate(paletteName: ThemePalette, hex?: string): { [formControlName: string]: string } {
        const nextColor = hex || this.themeService.getDefaultColorByPalette(paletteName);
        const palette = this.colorService.generateColorPaletteByHex(nextColor);
        const updateForm: any = {};
        for (const definition of palette) {
            const paletteKey = `${paletteName}_${definition.name}`;
            updateForm[paletteKey] = definition.hex;
        }
        return updateForm;
    }

    private getNextThemeName(): string {
        if (this.data) {
            return this.data.name!;
        } else {
            const currentThemeAmount = (this.organizationService.organization?.theme_ids || []).length;
            return `${this.organizationService.organization?.name} Theme (${currentThemeAmount + 1})`;
        }
    }
}
