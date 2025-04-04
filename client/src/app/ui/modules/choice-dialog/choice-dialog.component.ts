import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces';
import { OsOptionSelectionChanged, SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { ChoiceAnswer, ChoiceDialogConfig } from './definitions';

@Component({
    selector: `os-choice-dialog`,
    templateUrl: `./choice-dialog.component.html`,
    styleUrls: [`./choice-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        SearchSelectorModule,
        TranslatePipe
    ]
})
export class ChoiceDialogComponent {
    /**
     * One number selected, if this is a single select choice
     * User over template
     */
    public selectedChoice: number | null | undefined = undefined;

    /**
     * Form to hold the selection
     */
    public selectForm: UntypedFormGroup;

    /**
     * Checks if there is something selected
     *
     * @returns true if there is a selection chosen
     */
    public get hasSelection(): boolean {
        if (this.data && this.data.choices) {
            const formControl = this.selectForm.get(`select`);
            if (formControl) {
                return !!formControl.value || !!formControl.value?.length;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    private readonly _selectedItems: Record<Id, Selectable> = {};

    public constructor(
        public dialogRef: MatDialogRef<ChoiceDialogComponent, ChoiceAnswer>,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public readonly data: ChoiceDialogConfig
    ) {
        this.selectForm = this.formBuilder.group({
            select: []
        });
    }

    /**
     * Closes the dialog with the selected choices
     */
    protected closeDialog(ok: boolean, action?: string): void {
        if (!this.data.multiSelect && this.selectedChoice === null) {
            action = this.data.clearChoiceOption;
        }
        if (ok) {
            const resultValue = this.selectForm.get(`select`)?.value;
            const ids = Array.isArray(resultValue) ? resultValue : [resultValue];
            const items = Object.values(this._selectedItems);
            this.dialogRef.close({
                action: action ? action : null,
                ids,
                firstId: ids.at(0),
                items,
                firstItem: items.at(0)
            });
        } else {
            this.dialogRef.close();
        }
    }

    protected onSelectionChanged({ selected, value }: OsOptionSelectionChanged): void {
        if (selected) {
            this._selectedItems[value.id] = value;
        } else {
            delete this._selectedItems[value.id];
        }
    }
}
