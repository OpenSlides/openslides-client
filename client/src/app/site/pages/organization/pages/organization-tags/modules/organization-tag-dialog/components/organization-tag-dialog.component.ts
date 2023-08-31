import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { OrganizationTagDialogData } from '../services/organization-tag-dialog.service';

@Component({
    selector: `os-organization-tag-dialog`,
    templateUrl: `./organization-tag-dialog.component.html`,
    styleUrls: [`./organization-tag-dialog.component.scss`]
})
export class OrganizationTagDialogComponent extends BaseUiComponent implements OnInit {
    public get isCreateView(): boolean {
        return this._isCreateView;
    }

    public get currentColor(): string {
        return this._lastValidColor;
    }

    public organizationTagForm!: UntypedFormGroup;

    private get colorForm(): AbstractControl | null {
        return this.organizationTagForm.get(`color`);
    }

    private _isCreateView = false;
    private _lastValidColor = ``;

    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: OrganizationTagDialogData,
        private dialogRef: MatDialogRef<OrganizationTagDialogComponent>,
        private fb: UntypedFormBuilder
    ) {
        super();
    }

    public ngOnInit(): void {
        this.createForm();
        if (!this.data.organizationTag) {
            this._isCreateView = true;
        } else {
            this.updateForm();
        }
    }

    public onSaveClicked(): void {
        const { name, color }: { name: string; color: string } = this.organizationTagForm!.value;
        this.dialogRef.close({ name, color });
    }

    public generateColor(): void {
        this.organizationTagForm!.patchValue({ color: this.getRandomColor() });
    }

    public hasColorFormError(error: string): boolean {
        if (this.colorForm) {
            return this.colorForm.errors?.[error];
        }
        return false;
    }

    private getRandomColor(): string {
        return this.data.getRandomColor();
    }

    private createForm(): void {
        this._lastValidColor = this.data.defaultColor;
        this.organizationTagForm = this.fb.group({
            name: [``, Validators.required],
            color: [this._lastValidColor, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]
        });
        this.subscriptions.push(
            this.organizationTagForm.get(`color`)!.valueChanges.subscribe((currentColor: string) => {
                if (/^#[0-9a-fA-F]{6}$/.test(currentColor)) {
                    this._lastValidColor = currentColor;
                }
            })
        );
    }

    private updateForm(): void {
        const color = this.data.organizationTag!.color;
        const update = {
            name: this.data.organizationTag!.name,
            color
        };
        this.organizationTagForm!.patchValue(update);
    }
}
