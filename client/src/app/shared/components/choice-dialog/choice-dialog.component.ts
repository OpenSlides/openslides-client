import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { Identifiable } from 'app/shared/models/base/identifiable';
import { Displayable } from 'app/site/base/displayable';

type Choice = Displayable & Identifiable;

/**
 * All data needed for this dialog
 */
interface ChoiceDialogData {
    /**
     * A title to display
     */
    title: string;

    /**
     * Select if this should be a multiselect choice
     */
    multiSelect: boolean;

    /**
     * The choices to display
     */
    choices?: Observable<Choice[]> | Choice[];

    /**
     * Additional action buttons which will add their value to the
     * {@link closeDialog} feedback if chosen
     */
    actionButtons?: string[];

    /**
     * An optional string for 'explicitly select none of the options'. Only
     * displayed in the single-select variation
     */
    clearChoiceOption?: string;
}

interface ChoiceDialogResult {
    action?: string;
    items: number | number[];
}

/**
 * undefined is returned, if the dialog is closed. If a choice is submitted,
 * it will be an array of numbers and optionally an action string for multichoice
 * dialogs
 */
export type ChoiceAnswer = undefined | ChoiceDialogResult;

/**
 * A dialog with choice fields.
 *
 */
@Component({
    selector: 'os-choice-dialog',
    templateUrl: './choice-dialog.component.html',
    styleUrls: ['./choice-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChoiceDialogComponent {
    /**
     * One number selected, if this is a single select choice
     * User over template
     */
    public selectedChoice: number;

    /**
     * Form to hold the selection
     */
    public selectForm: FormGroup;

    /**
     * Checks if there is something selected
     *
     * @returns true if there is a selection chosen
     */
    public get hasSelection(): boolean {
        if (this.data && this.data.choices) {
            if (this.selectForm.get('select').value) {
                return !!this.selectForm.get('select').value || !!this.selectForm.get('select').value.length;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    /**
     * All selected ids, if this is a multiselect choice
     */
    public selectedMultiChoices: number[] = [];

    public constructor(
        public dialogRef: MatDialogRef<ChoiceDialogComponent, ChoiceAnswer>,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: ChoiceDialogData
    ) {
        this.selectForm = this.formBuilder.group({
            select: []
        });
    }

    /**
     * Closes the dialog with the selected choices
     */
    public closeDialog(ok: boolean, action?: string): void {
        if (!this.data.multiSelect && this.selectedChoice === null) {
            action = this.data.clearChoiceOption;
        }
        if (ok) {
            const resultValue = this.selectForm.get('select').value;
            this.dialogRef.close({
                action: action ? action : null,
                items: resultValue
            });
        } else {
            this.dialogRef.close();
        }
    }
}
