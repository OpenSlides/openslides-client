import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'app/core/definitions/key-types';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { BasePollDialogService } from 'app/core/ui-services/base-poll-dialog.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { PollState, PollType } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { BehaviorSubject } from 'rxjs';

@Component({
    template: ``
})
export abstract class BasePollComponent<C extends BaseViewModel = any> extends BaseModelContextComponent {
    private stateChangePendingSubject = new BehaviorSubject<boolean>(false);

    public readonly stateChangePendingObservable = this.stateChangePendingSubject.asObservable();

    public get poll(): ViewPoll<C> {
        return this._poll;
    }

    public pollStateActions = {
        [PollState.Created]: {
            icon: `play_arrow`,
            css: `start-poll-button`
        },
        [PollState.Started]: {
            icon: `stop`,
            css: `stop-poll-button`
        },
        [PollState.Finished]: {
            icon: `public`,
            css: `publish-poll-button`
        }
    };

    public get hideChangeState(): boolean {
        return this._poll.isPublished || (this._poll.isCreated && this._poll.type === PollType.Analog);
    }

    protected _id: Id;
    protected _poll: ViewPoll<C>;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        protected dialog: MatDialog,
        protected promptService: PromptService,
        protected choiceService: ChoiceService,
        protected repo: PollRepositoryService,
        protected pollDialog: BasePollDialogService
    ) {
        super(componentServiceCollector, translate);
    }

    public async nextPollState(): Promise<void> {
        const currentState: PollState = this._poll.state;
        if (currentState === PollState.Created || currentState === PollState.Finished) {
            await this.changeState(this._poll.nextState);
        } else if (currentState === PollState.Started) {
            const title = this.translate.instant(`Are you sure you want to stop this voting?`);
            const STOP_LABEL = this.translate.instant(`Stop`);
            const STOP_PUBLISH_LABEL = this.translate.instant(`Stop & publish`);
            const actions = [STOP_LABEL, STOP_PUBLISH_LABEL];
            const choice = await this.choiceService.open(title, null, false, actions);

            if (choice?.action === STOP_LABEL) {
                await this.changeState(PollState.Finished);
            } else if (choice?.action === STOP_PUBLISH_LABEL) {
                await this.changeState(PollState.Published);
            }
        }
    }

    private async changeState(targetState: PollState): Promise<void> {
        this.stateChangePendingSubject.next(true);
        await this.repo.changePollState(this._poll, targetState).catch(this.raiseError);
        this.stateChangePendingSubject.next(false);
    }

    public async resetState(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to reset this vote?`);
        const content = this.translate.instant(`All votes will be lost.`);
        if (await this.promptService.open(title, content)) {
            this.changeState(PollState.Created);
        }
    }

    /**
     * Handler for the 'delete poll' button
     */
    public async deletePoll(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this vote?`);
        const content = this._poll.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this._poll);
        }
    }

    /**
     * Edits the poll
     */
    public openDialog(): void {
        this.pollDialog.openDialog(this._poll);
    }

    protected initializePoll(id: Id): void {
        this._id = id;
        this.loadPoll(this._id);
    }

    /**
     * Hook to listen to changes. A poll is already available.
     */
    protected onAfterUpdatePoll(_poll: ViewPoll<C>): void {}

    protected loadPoll(id: Id): void {
        this.subscribe(
            {
                viewModelCtor: ViewPoll,
                ids: [id],
                follow: [
                    {
                        idField: `option_ids`,
                        follow: [{ idField: `vote_ids` }, { idField: `content_object_id` }]
                    },
                    {
                        idField: `global_option_id`,
                        follow: [{ idField: `vote_ids` }]
                    },
                    {
                        idField: `entitled_group_ids`
                    }
                ]
            },
            `${this.constructor.name}:${this._id}`
        );

        this.subscriptions.push(
            this.repo.getViewModelObservable(this._id).subscribe(poll => {
                if (poll) {
                    this._poll = poll;
                    this.onAfterUpdatePoll(poll);
                }
            })
        );
    }

    public abstract getDetailLink(): string;
}
