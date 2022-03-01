import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { HtmlColor } from 'app/core/definitions/key-types';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewOrganizationTag } from 'app/management/models/view-organization-tag';
import { BaseComponent } from 'app/site/base/components/base.component';

interface OrganizationTagDialogData {
    organizationTag?: ViewOrganizationTag;
    defaultColor: HtmlColor;
    getRandomColor: () => HtmlColor;
}

@Component({
    selector: `os-organization-tag-dialog`,
    templateUrl: `./organization-tag-dialog.component.html`,
    styleUrls: [`./organization-tag-dialog.component.scss`]
})
export class OrganizationTagDialogComponent extends BaseComponent implements OnInit {
    public get isCreateView(): boolean {
        return this._isCreateView;
    }

    public get currentColor(): string {
        return this._lastValidColor;
    }

    public organizationTagForm: FormGroup;

    private _isCreateView = false;
    private _lastValidColor: string;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: OrganizationTagDialogData,
        private dialogRef: MatDialogRef<OrganizationTagDialogComponent>,
        private fb: FormBuilder
    ) {
        super(componentServiceCollector, translate);
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
        const { name, color }: { name: string; color: string } = this.organizationTagForm.value;
        this.dialogRef.close({ name, color: color.startsWith(`#`) ? color : `#${color}` });
    }

    public generateColor(): void {
        this.organizationTagForm.patchValue({ color: this.getRandomColor() });
    }

    private getRandomColor(): string {
        return this.getColor(this.data.getRandomColor());
    }

    private createForm(): void {
        this._lastValidColor = this.getColor(this.data.defaultColor);
        this.organizationTagForm = this.fb.group({
            name: [``, Validators.required],
            color: [this._lastValidColor, Validators.pattern(/^[0-9a-fA-F]{6}$/)]
        });
        this.subscriptions.push(
            this.organizationTagForm.get(`color`).valueChanges.subscribe((currentColor: string) => {
                if (currentColor.length === 6) {
                    this._lastValidColor = currentColor;
                }
            })
        );
    }

    private updateForm(): void {
        const color = this.data.organizationTag.color;
        const update = {
            name: this.data.organizationTag.name,
            color: this.getColor(color)
        };
        this.organizationTagForm.patchValue(update);
    }

    private getColor(htmlCode: HtmlColor): string {
        return htmlCode.startsWith(`#`) ? htmlCode.slice(1) : htmlCode;
    }
}
