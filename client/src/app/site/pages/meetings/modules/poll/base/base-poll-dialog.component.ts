import { Directive, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollVisibility } from 'src/app/domain/models/poll';
import { PollUpdatePayload } from 'src/app/gateways/vote-api.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { PollEditResultComponent } from '../components/poll-edit-result/poll-edit-result.component';
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

export interface PollMethodPayload {
    method: string;
    method_config: unknown;
}

export interface PollOptionsPayload {
    option_type?: 'text' | 'meeting_user';
    options?: (string | number)[];
}

/**
 * A dialog for updating the values of a poll.
 */
@Directive()
export abstract class BasePollDialogComponent extends BaseUiComponent {
    protected pollForm = viewChild.required(PollFormComponent);
    protected pollResultForm = viewChild(PollEditResultComponent);

    public get formsValid(): boolean {
        if (!this.pollForm) {
            return false;
        }

        return this.pollForm().pollForm.valid;
    }

    public analogPollFormOpen = signal(false);
    public isAnalogPoll = rxResource({
        params: () => this.pollForm(),
        defaultValue: false,
        stream({ params }) {
            return params.pollForm.get(`visibility`).valueChanges.pipe(map(v => v === PollVisibility.Manually));
        }
    });

    protected formBuilder = inject(UntypedFormBuilder);
    public dialogRef = inject(MatDialogRef<BasePollDialogComponent>);
    public pollData: ViewPoll = inject(MAT_DIALOG_DATA);

    public constructor() {
        super();
        this.addKeyListener();
    }

    /**
     * Submits the values from dialog.
     */
    public submitPoll(): void {
        const formValues = this.pollForm().getValues();
        const visibility: PollVisibility = formValues?.visibility;

        const payload: PollUpdatePayload = {
            title: formValues?.title,
            ...this.methodPayload(),
            ...this.optionsPayload(),
            visibility,
            allow_vote_split: false
        };

        if (visibility !== PollVisibility.Manually) {
            payload.entitled_group_ids = formValues?.entitled_group_ids ?? [];
            payload.live_voting_enabled = formValues?.live_voting_enabled ?? false;
        } else if (this.pollResultForm()) {
            const result = this.pollResultForm().serializeResult();
            if (result) {
                payload.result = result;
            }
        }

        this.dialogRef.close(payload);
    }

    /**
     * Returns the poll method related part of the payload
     */
    public abstract methodPayload(): PollMethodPayload;

    /**
     * Returns the poll options related part of the payload
     */
    public abstract optionsPayload(): PollOptionsPayload;

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
}
