import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { BaseModel } from 'app/shared/models/base/base-model';
import { Poll } from 'app/shared/models/poll/poll';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { BasePollDialogComponent } from 'app/site/polls/components/base-poll-dialog.component';
import { Fqid } from '../definitions/key-types';
import { PollAction } from '../actions/poll-action';
import { PollRepositoryService } from '../repositories/polls/poll-repository.service';

export interface PollDialogData {
    // Required
    title: string;
    type: string;
    pollmethod: string;
    content_object_id?: Fqid;
    content_object: BaseModel;
    poll?: Poll;

    isPublished?: boolean;
    onehundred_percent_base?: string;
    majority_method?: string;
}

export interface PollDialogResult {
    amount_global_yes?: string;
    amount_global_no?: string;
    amount_global_abstain?: string;
    votesvalid?: string;
    votesinvalid?: string;
    votescast?: string;
    options: { [key: string]: { Y?: string; N?: string; A?: string } };
}

/**
 * Abstract class for showing a poll dialog. Has to be subclassed to provide the right `PollService`
 */
@Injectable({
    providedIn: 'root'
})
export abstract class BasePollDialogService {
    protected dialogComponent: ComponentType<BasePollDialogComponent>;

    public constructor(private dialog: MatDialog, protected repo: PollRepositoryService) {}

    /**
     * Opens the dialog to enter votes and edit the meta-info for a poll.
     *
     * @param data Passing the (existing or new) data for a poll
     */
    public async openDialog(viewPoll: any): Promise<void> {
        if (!this.dialogComponent) {
            throw new Error('TODO: No dialog-component is given!');
        }
        const dialogRef = this.dialog.open(this.dialogComponent, {
            data: viewPoll,
            ...mediumDialogSettings
        });
        const result = await dialogRef.afterClosed().toPromise();
        if (!result) {
            return;
        }
        if (!viewPoll.poll) {
            await this.create(result);
        } else {
            await this.update(result, viewPoll);
        }
    }

    protected async create(payload: any): Promise<void> {
        await this.repo.create(payload);
    }

    protected async update(payload: any, poll: ViewPoll): Promise<void> {
        const optionUpdatePayload: PollAction.OptionUpdatePayload[] = poll.options.map((option, index) => ({
            id: option.id,
            ...payload.options[index]
        }));
        await this.repo.update(payload, poll, optionUpdatePayload);
    }
}
