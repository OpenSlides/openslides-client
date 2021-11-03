import { Directive, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PollAction } from 'app/core/actions/poll-action';
import { Fqid } from 'app/core/definitions/key-types';
import { PollDialogData } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModel } from 'app/shared/models/base/base-model';
import { Identifiable } from 'app/shared/models/base/identifiable';
import {
    LOWEST_VOTE_VALUE,
    PollClassType,
    PollMethod,
    PollType,
    VOTE_UNDOCUMENTED,
    VoteValue,
    VoteValueVerbose
} from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { OneOfValidator } from 'app/shared/validators/one-of-validator';
import { BaseComponent } from 'app/site/base/components/base.component';

import { PollFormComponent } from './poll-form/poll-form.component';

export interface OptionsObject {
    fqid: Fqid;
    content_object?: BaseModel;
}

/**
 * A dialog for updating the values of a poll.
 */
@Directive()
export abstract class BasePollDialogComponent extends BaseComponent implements OnInit {
    public dialogVoteForm: FormGroup;

    public publishImmediately: boolean;

    public voteValueVerbose = VoteValueVerbose;

    public pollClassType = PollClassType;

    /**
     * The summary values that will have fields in the dialog
     */
    public readonly sumValues: string[] = [`votesvalid`, `votesinvalid`, `votescast`];

    /**
     * vote entries for each option in this component. Is empty if method
     * requires one vote per candidate
     */
    public analogVoteFields: VoteValue[] = [];

    public get isAnalogPoll(): boolean {
        return this.pollForm?.contentForm?.get(`type`).value === PollType.Analog || false;
    }

    @ViewChild(`pollForm`, { static: true })
    protected pollForm: PollFormComponent;

    protected options: OptionsObject[] = [];

    public get formsValid(): boolean {
        return this.pollForm.contentForm.valid && this.dialogVoteForm.valid;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public dialogRef: MatDialogRef<BasePollDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public pollData: PollDialogData | ViewPoll,
        protected formBuilder: FormBuilder
    ) {
        super(componentServiceCollector, translate);
        this.addKeyListener();
    }

    public ngOnInit(): void {
        this.onBeforeInit();
        this.createOptions();
        this.triggerUpdate();
    }

    private addKeyListener(): void {
        if (this.dialogRef) {
            this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
                if (event.key === `Enter` && event.shiftKey) {
                    this.submitPoll();
                }

                if (event.key === `Escape`) {
                    this.dialogRef.close();
                }
            });
        }
    }

    /**
     * Submits the values from dialog.
     */
    public submitPoll(): void {
        const pollForm = this.pollForm.getValues();
        const voteForm = this.dialogVoteForm.value;
        const payload: any = { ...pollForm, ...voteForm, publish_immediately: this.publishImmediately };
        payload.options = this.getOptions(voteForm.options);
        this.dialogRef.close(payload);
    }

    /**
     * Handles the state-change of the checkbox `Publish immediately`.
     *
     * If it is checked, at least one of the fields have to be filled.
     *
     * @param checked The next state.
     */
    public publishStateChanged(checked: boolean): void {
        if (checked) {
            this.dialogVoteForm.setValidators(OneOfValidator.validation(Object.keys(this.dialogVoteForm.controls)));
        } else {
            this.dialogVoteForm.setValidators(null);
        }
    }

    public getVoteData(): object {
        if (this.isVoteDataEmpty(this.dialogVoteForm.value)) {
            return undefined;
        }
        return this.replaceEmptyValues(this.dialogVoteForm.value);
    }

    protected abstract getContentObjectsForOptions(): BaseModel[];
    protected abstract getAnalogVoteFields(): VoteValue[];
    protected onBeforeInit(): void {}

    protected triggerUpdate(): void {
        this.analogVoteFields = this.getAnalogVoteFields();
        this.createDialog();
    }

    /**
     * reverses the replacement of empty values by VOTE_UNDOCUMENTED; replaces each
     * VOTE_UNDOCUMENTED with null
     *
     * @param voteData the vote data
     */
    protected undoReplaceEmptyValues(voteData: object): object {
        return this.replaceEmptyValues(voteData, true);
    }

    /**
     * check recursively whether the given vote data object is empty, meaning all values would
     * be VOTE_UNDOCUMENTED when sent
     *
     * @param voteData the (partial) vote data
     */
    private isVoteDataEmpty(voteData: object): boolean {
        return Object.values(voteData).every(
            value => !value || (typeof value === `object` && this.isVoteDataEmpty(value))
        );
    }

    /**
     * iterates over the given data and returns a new object with all empty fields recursively
     * replaced with VOTE_UNDOCUMENTED
     * @param voteData the (partial) data
     */
    private replaceEmptyValues(voteData: object, undo: boolean = false): object {
        const result = {};
        for (const key of Object.keys(voteData)) {
            if (typeof voteData[key] === `object` && voteData[key]) {
                result[key] = this.replaceEmptyValues(voteData[key], undo);
            } else {
                if (undo) {
                    result[key] = voteData[key] === VOTE_UNDOCUMENTED ? null : voteData[key];
                } else {
                    result[key] = !!voteData[key] ? voteData[key] : VOTE_UNDOCUMENTED;
                }
            }
        }
        return result;
    }

    private getOptions(options: object): (PollAction.AnalogOption & Identifiable)[] {
        const result = [];
        const optionKeys = Object.keys(options);
        for (let index = 0; index < optionKeys.length; ++index) {
            result.push({
                ...options[optionKeys[index]],
                id: this.pollData.poll?.option_ids[index],
                content_object_id: optionKeys[index]
            });
        }
        return result;
    }

    private createOptions(): void {
        if (this.pollData) {
            if (this.pollData instanceof ViewPoll) {
                this.options = this.pollData.options;
            } else {
                this.options = this.getContentObjectsForOptions().map(
                    contentObject => ({
                        fqid: contentObject.fqid,
                        content_object: contentObject
                    }),
                    {}
                );
            }
        }
    }

    /**
     * Pre-executed method to initialize the dialog-form depending on the poll-method.
     */
    private createDialog(): void {
        if (this.options) {
            this.dialogVoteForm = this.formBuilder.group({
                options: this.formBuilder.group(
                    // create a form group for each option with the user id as key
                    this.options?.mapToObject(option => ({
                        [option.fqid]: this.formBuilder.group(
                            // for each user, create a form group with a control for each valid input (Y, N, A)
                            this.analogVoteFields?.mapToObject(value => ({
                                [value]: [``, [Validators.min(LOWEST_VOTE_VALUE)]]
                            }))
                        )
                    }))
                ),
                amount_global_yes: [``, [Validators.min(LOWEST_VOTE_VALUE)]],
                amount_global_no: [``, [Validators.min(LOWEST_VOTE_VALUE)]],
                amount_global_abstain: [``, [Validators.min(LOWEST_VOTE_VALUE)]],
                // insert all used global fields
                ...this.sumValues?.mapToObject(sumValue => ({
                    [sumValue]: [``, [Validators.min(LOWEST_VOTE_VALUE)]]
                }))
            });
            setTimeout(() => {
                if (this.isAnalogPoll && this.pollData instanceof ViewPoll) {
                    this.updateDialogVoteForm(this.pollData);
                }
            });
        }
    }

    private updateDialogVoteForm(data: Partial<ViewPoll>): void {
        const update = {
            options: {},
            votesvalid: data.votesvalid,
            votesinvalid: data.votesinvalid,
            votescast: data.votescast,
            amount_global_yes: data.global_option?.yes,
            amount_global_no: data.global_option?.no,
            amount_global_abstain: data.global_option?.abstain
        };
        for (const option of data.options) {
            const votes: any = {};
            votes.Y = option.yes;
            if (data.pollmethod !== PollMethod.Y) {
                votes.N = option.no;
            }
            if (data.pollmethod === PollMethod.YNA) {
                votes.A = option.abstain;
            }
            update.options[option.fqid] = votes;
        }

        if (this.dialogVoteForm) {
            const result = this.undoReplaceEmptyValues(update);
            this.dialogVoteForm.patchValue(result);
        }
    }
}
