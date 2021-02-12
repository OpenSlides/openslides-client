import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { Collection } from 'app/shared/models/base/collection';
import { PollState, PollType } from 'app/shared/models/poll/base-poll';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { BasePollDialogComponent } from 'app/site/polls/components/base-poll-dialog.component';
import { BaseViewPoll } from 'app/site/polls/models/base-view-poll';
import { PollService } from 'app/site/polls/services/poll.service';
import { MotionPollRepositoryService } from '../repositories/motions/motion-poll-repository.service';

/**
 * Abstract class for showing a poll dialog. Has to be subclassed to provide the right `PollService`
 */
@Injectable({
    providedIn: 'root'
})
export abstract class BasePollDialogService<V extends BaseViewPoll, S extends PollService> {
    protected dialogComponent: ComponentType<BasePollDialogComponent<V, S>>;

    public constructor(private dialog: MatDialog, private mapper: CollectionMapperService) {}

    /**
     * Opens the dialog to enter votes and edit the meta-info for a poll.
     *
     * @param data Passing the (existing or new) data for the poll
     */
    public async openDialog(viewPoll: Partial<V> & Collection): Promise<void> {
        const dialogRef = this.dialog.open(this.dialogComponent, {
            data: viewPoll,
            ...mediumDialogSettings
        });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) {
            const repo = this.mapper.getRepository(viewPoll.collection) as MotionPollRepositoryService;
            if (!viewPoll.poll) {
                // await repo.create(result);
            } else {
                let update = result;
                if (viewPoll.state !== PollState.Created) {
                    update = {
                        title: result.title,
                        onehundred_percent_base: result.onehundred_percent_base,
                        majority_method: result.majority_method,
                        description: result.description
                    };
                    if (viewPoll.type === PollType.Analog) {
                        update = {
                            ...update,
                            votes: result.votes,
                            publish_immediately: result.publish_immediately
                        };
                    }
                }
                // await repo.update(update, <V>viewPoll);
            }
        }
    }
}
