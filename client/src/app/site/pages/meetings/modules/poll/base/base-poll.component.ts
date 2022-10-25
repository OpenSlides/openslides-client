import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { PollState, PollType } from 'src/app/domain/models/poll/poll-constants';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { CheckVoteValidityDialogComponent } from '../components/check-vote-validity-dialog/check-vote-validity-dialog.component';
import { VotingCryptographyInfoDialogService } from '../modules/voting-cryptography-info-dialog/services/voting-cryptography-info-dialog.service';
import { VotingPrivacyWarningDialogService } from '../modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { PollControllerService } from '../services/poll-controller.service/poll-controller.service';
import { PollDialogService } from '../services/poll-dialog.service';

@Directive()
export abstract class BasePollComponent<C extends BaseViewModel = any> extends BaseMeetingComponent {
    private stateChangePendingSubject = new BehaviorSubject<boolean>(false);

    public readonly stateChangePendingObservable = this.stateChangePendingSubject.asObservable();

    public get poll(): ViewPoll<C> {
        return this._poll;
    }

    public get canSeeCheckValidity(): boolean {
        return this.poll.type === PollType.Cryptographic && !!this.poll.votes_raw;
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
        },
        [PollState.Published]: {
            icon: ``,
            css: ``
        }
    };

    public get hideChangeState(): boolean {
        return this._poll.isPublished || (this._poll.isCreated && this._poll.type === PollType.Analog);
    }

    protected _id!: Id;
    protected _poll!: ViewPoll<C>;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        protected promptService: PromptService,
        protected choiceService: ChoiceService,
        protected repo: PollControllerService,
        private dialog: PollDialogService,
        private votingPrivacyDialog: VotingPrivacyWarningDialogService,
        private votingCryptoInfoDialog: VotingCryptographyInfoDialogService
    ) {
        super(componentServiceCollector, translate);
    }

    public openVotingWarning(): void {
        if (this.poll?.isCryptographic) {
            this.votingCryptoInfoDialog.open(this.poll);
        } else {
            this.votingPrivacyDialog.open();
        }
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
            const choice = await this.choiceService.open({ title, multiSelect: false, actions });

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

    protected initializePoll(id: Id): void {
        this._id = id;
        this.loadPoll(this._id);
    }

    /**
     * Hook to listen to changes. A poll is already available.
     */
    protected onAfterUpdatePoll(_poll: ViewPoll<C>): void {}

    protected loadPoll(id: Id): void {
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

    public openCheckValidityDialog(): void {
        this.dialog.open(CheckVoteValidityDialogComponent, { ...infoDialogSettings, data: this.poll });
    }
}
