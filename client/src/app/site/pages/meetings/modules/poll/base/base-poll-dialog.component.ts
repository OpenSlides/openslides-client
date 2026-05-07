import { Directive, inject, viewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { PollFormComponent } from '../components/poll-form/poll-form.component';

export interface OptionsObject {
    fqid?: Fqid; // Obligatory if optionTypeText===false and this isn't a list
    text?: string; // Obligatory if optionTypeText===true
    poll_candidate_user_ids?: Id[]; // Obligatory if optionTypeText===false and this is a list
    content_object?: BaseModel;
}

export interface OptionsObjectForText {
    text: string;
}

/**
 * A dialog for updating the values of a poll.
 */
@Directive()
export abstract class BasePollDialogComponent extends BaseUiComponent {
    protected pollForm = viewChild.required(PollFormComponent);

    public get formsValid(): boolean {
        if (!this.pollForm) {
            return false;
        }

        return this.pollForm().pollForm.valid;
    }

    protected formBuilder = inject(UntypedFormBuilder);
    public dialogRef = inject(MatDialogRef<BasePollDialogComponent>);
    public pollData: ViewPoll = inject(MAT_DIALOG_DATA);

    public constructor() {
        super();
        this.addKeyListener();
    }

    private addKeyListener(): void {
        if (!this.dialogRef) {
            return;
        }

        this.subscriptions.push(
            this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
                if (event.key === `Enter` && event.shiftKey) {
                    this.submitPoll();
                }

                if (event.key === `Escape`) {
                    this.dialogRef.close();
                }
            })
        );
    }

    /**
     * Submits the values from dialog.
     */
    public abstract submitPoll(): void;
}
