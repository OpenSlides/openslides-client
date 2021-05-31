import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { HtmlColor } from 'app/core/definitions/key-types';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewOrganisationTag } from 'app/management/models/view-organisation-tag';
import { BaseComponent } from 'app/site/base/components/base.component';

interface OrganisationTagDialogData {
    organisationTag?: ViewOrganisationTag;
    getRandomColor: () => HtmlColor;
}

@Component({
    selector: 'os-organisation-tag-dialog',
    templateUrl: './organisation-tag-dialog.component.html',
    styleUrls: ['./organisation-tag-dialog.component.scss']
})
export class OrganisationTagDialogComponent extends BaseComponent implements OnInit {
    public get isCreateView(): boolean {
        return this._isCreateView;
    }

    public get currentColor(): string {
        return this._lastValidColor;
    }

    public organisationTagForm: FormGroup;

    private _isCreateView = false;
    private _lastValidColor: string;

    public constructor(
        serviceCollector: ComponentServiceCollector,
        @Inject(MAT_DIALOG_DATA) public data: OrganisationTagDialogData,
        private dialogRef: MatDialogRef<OrganisationTagDialogComponent>,
        private fb: FormBuilder
    ) {
        super(serviceCollector);
    }

    public ngOnInit(): void {
        this.createForm();
        if (!this.data.organisationTag) {
            this._isCreateView = true;
        } else {
            this.updateForm();
        }
    }

    public onSaveClicked(): void {
        const { name, color }: { name: string; color: string } = this.organisationTagForm.value;
        this.dialogRef.close({ name, color: `#${color}` });
    }

    public generateColor(): void {
        this.organisationTagForm.patchValue({ color: this.getRandomColor() });
    }

    private getRandomColor(): string {
        const nextColor = this.data.getRandomColor();
        return nextColor.startsWith('#') ? nextColor.slice(1) : nextColor;
    }

    private createForm(): void {
        this._lastValidColor = this.getRandomColor();
        this.organisationTagForm = this.fb.group({
            name: ['', Validators.required],
            color: [this._lastValidColor, Validators.pattern(/^[0-9a-fA-F]{6}$/)]
        });
        this.subscriptions.push(
            this.organisationTagForm.get('color').valueChanges.subscribe((currentColor: string) => {
                if (currentColor.length === 6) {
                    this._lastValidColor = currentColor;
                }
            })
        );
    }

    private updateForm(): void {
        const color = this.data.organisationTag.color;
        const update = {
            name: this.data.organisationTag.name,
            color: color.startsWith('#') ? color.slice(1) : color
        };
        this.organisationTagForm.patchValue(update);
    }
}
