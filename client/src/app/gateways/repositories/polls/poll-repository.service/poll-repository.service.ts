import { Injectable } from '@angular/core';
import { Decimal } from 'src/app/domain/definitions/key-types';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollState, PollType } from 'src/app/domain/models/poll/poll-constants';
import { toDecimal } from 'src/app/infrastructure/utils';
import { VoteControllerService } from 'src/app/site/pages/meetings/modules/poll/services/vote-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { DEFAULT_FIELDSET, Fieldsets, ROUTING_FIELDSET } from 'src/app/site/services/model-request-builder';

import { Identifiable } from '../../../../domain/interfaces/identifiable';
import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { VoteRepositoryService } from '../vote-repository.service';
import { PollAction } from './poll.action';

interface AnalogPollVotesValues {
    votescast?: Decimal;
    votesvalid?: Decimal;
    votesinvalid?: Decimal;
}

interface AnalogPollGlobalValues {
    amount_global_yes?: Decimal;
    amount_global_no?: Decimal;
    amount_global_abstain?: Decimal;
}

@Injectable({
    providedIn: `root`
})
export class PollRepositoryService extends BaseMeetingRelatedRepository<ViewPoll, Poll> {
    public constructor(
        repoServiceCollector: RepositoryMeetingServiceCollectorService,
        private voteController: VoteControllerService,
        private voteRepo: VoteRepositoryService
    ) {
        super(repoServiceCollector, Poll);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Polls` : `Poll`);
    public getTitle = (viewModel: ViewPoll): string => viewModel.title;

    public override getFieldsets(): Fieldsets<Poll> {
        const routingFields: (keyof Poll)[] = [`sequential_number`, `meeting_id`];
        const listFieldset: (keyof Poll)[] = routingFields.concat([
            `entitled_group_ids`,
            `state`,
            `title`,
            `type`,
            `pollmethod`,
            `onehundred_percent_base`,
            `backend`,
            `content_object_id`
        ]);
        const detailFieldset: (keyof Poll)[] = listFieldset.concat(
            `voted_ids`,
            `votescast`,
            `votesinvalid`,
            `votesvalid`,
            `option_ids`,
            `onehundred_percent_base`,
            `global_option_id`,
            `global_yes`,
            `global_no`,
            `global_abstain`,
            `min_votes_amount`,
            `max_votes_amount`,
            `max_votes_per_option`,
            `entitled_users_at_stop`,
            `vote_count`,
            `backend`
        );
        return {
            [DEFAULT_FIELDSET]: detailFieldset,
            [ROUTING_FIELDSET]: routingFields,
            list: listFieldset
        };
    }

    public async create(poll: any): Promise<Identifiable> {
        if (
            Array.isArray(poll.options) &&
            typeof poll.min_votes_amount === `number` &&
            typeof poll.max_votes_per_option === `number` &&
            poll.options?.length < poll.min_votes_amount / poll.max_votes_per_option
        ) {
            throw new Error(
                `Poll creation aborted because the minimum amount of votes was set higher than the number of available options`
            );
        }
        if (poll.type === PollType.Analog) {
            return this.createAnalogPoll(poll);
        } else {
            return this.createElectronicPoll(poll);
        }
    }

    public async update(update: any, viewPoll: ViewPoll, option: any[] = []): Promise<void> {
        if (update.type === PollType.Analog) {
            return this.updateAnalogPoll(update, viewPoll, option);
        } else {
            return this.updateElectronicPoll(update, viewPoll);
        }
    }

    private async createAnalogPoll(poll: any): Promise<Identifiable> {
        const payload = {
            meeting_id: this.activeMeetingId,
            title: poll.title,
            onehundred_percent_base: poll.onehundred_percent_base,
            pollmethod: poll.pollmethod,
            publish_immediately: poll.publish_immediately,
            type: poll.type,
            global_abstain: poll.global_abstain,
            global_no: poll.global_no,
            global_yes: poll.global_yes,
            max_votes_amount: poll.max_votes_amount,
            max_votes_per_option: poll.max_votes_per_option,
            min_votes_amount: poll.min_votes_amount,
            description: poll.description,
            options: this.getAnalogOptions(poll.options),
            content_object_id: poll.content_object_id,
            ...this.getAnalogPollVotesValues(poll),
            ...this.getAnalogPollGlobalValues(poll)
        };
        return this.sendActionToBackend(PollAction.CREATE, payload);
    }

    private async createElectronicPoll(poll: any): Promise<Identifiable> {
        const payload = {
            meeting_id: this.activeMeetingId,
            title: poll.title,
            onehundred_percent_base: poll.onehundred_percent_base,
            pollmethod: poll.pollmethod,
            type: poll.type,
            global_abstain: poll.global_abstain,
            global_no: poll.global_no,
            global_yes: poll.global_yes,
            max_votes_amount: poll.max_votes_amount,
            min_votes_amount: poll.min_votes_amount,
            max_votes_per_option: poll.max_votes_per_option,
            description: poll.description,
            options: this.getElectronicOptions(poll.options),
            content_object_id: poll.content_object_id,
            entitled_group_ids: poll.entitled_group_ids,
            backend: poll.backend
        };
        return this.sendActionToBackend(PollAction.CREATE, payload);
    }

    private async updateAnalogPoll(update: any, poll: ViewPoll, option: any[]): Promise<void> {
        let payload: any;
        if (poll.state === PollState.Created) {
            payload = this.getUpdateCreatedAnalogPollPayload(update, poll);
        } else {
            payload = this.updateOtherStateAnalogPoll(update, poll);
        }
        const optionUpdatePayload = this.getAnalogOptions(option, true);
        return this.sendActionsToBackend([
            { action: PollAction.UPDATE, data: [payload] },
            { action: PollAction.UPDATE_OPTION, data: optionUpdatePayload }
        ]);
    }

    private async updateElectronicPoll(update: any, poll: Poll): Promise<void> {
        /**
         * We still want to alter the title and the 100% base after the
         * poll was saved.
         *
         * TODO:
         * This can be heavily streamlined:
         * generically, on all "update" (not create) tasks,
         * compare the current poll with the update and only send
         * the stuff that is different, since in this
         * regard the form already only allows to change
         * title and %base
         */
        if (poll.state !== PollState.Created) {
            update = {
                title: update.title,
                onehundred_percent_base: update.onehundred_percent_base
            };
        }
        return this.updateCreatedElectronicPoll(update, poll);
    }

    public async delete(poll: Identifiable): Promise<void> {
        const payload: Identifiable = { id: poll.id };
        return this.sendActionToBackend(PollAction.DELETE, payload);
    }

    private getUpdateCreatedAnalogPollPayload(update: any, poll: Poll): any {
        const payload = {
            id: poll.id,
            publish_immediately: update.publish_immediately,
            allow_multiple_votes_per_candidate: update.allow_multiple_votes_per_candidate,
            description: update.description,
            max_votes_amount: update.max_votes_amount,
            min_votes_amount: update.min_votes_amount,
            max_votes_per_option: update.max_votes_per_option,
            onehundred_percent_base: update.onehundred_percent_base,
            pollmethod: update.pollmethod,
            title: update.title,
            ...this.getAnalogPollVotesValues(update)
        };
        return payload;
    }

    private updateOtherStateAnalogPoll(update: any, poll: Poll): any {
        const payload: any = {
            id: poll.id,
            publish_immediately: update.publish_immediately,
            description: update.description,
            onehundred_percent_base: update.onehundred_percent_base,
            title: update.title,
            ...this.getAnalogPollVotesValues(update)
        };
        return payload;
    }

    private async updateCreatedElectronicPoll(update: any, poll: Poll): Promise<void> {
        const payload = {
            id: poll.id,
            entitled_group_ids: update.entitled_group_ids,
            allow_multiple_votes_per_candidate: update.allow_multiple_votes_per_candidate,
            description: update.description,
            max_votes_amount: update.max_votes_amount,
            min_votes_amount: update.min_votes_amount,
            max_votes_per_option: update.max_votes_per_option,
            onehundred_percent_base: update.onehundred_percent_base,
            pollmethod: update.pollmethod,
            title: update.title,
            backend: update.backend,
            global_abstain: update.global_abstain,
            global_no: update.global_no,
            global_yes: update.global_yes
        };
        return this.sendActionToBackend(PollAction.UPDATE, payload);
    }

    private getAnalogPollVotesValues(poll: any): AnalogPollVotesValues {
        return {
            votescast: toDecimal(poll.votescast, false),
            votesinvalid: toDecimal(poll.votesinvalid, false),
            votesvalid: toDecimal(poll.votesvalid, false)
        };
    }

    private getAnalogPollGlobalValues(poll: any): AnalogPollGlobalValues {
        return {
            amount_global_abstain: toDecimal(poll.amount_global_abstain, false),
            amount_global_no: toDecimal(poll.amount_global_no, false),
            amount_global_yes: toDecimal(poll.amount_global_yes, false)
        };
    }

    private getAnalogOptions(pollOptions: any[], isUpdate: boolean = false): any[] {
        const result: any[] = [];
        for (const option of pollOptions) {
            if (!isUpdate) {
                this.validateOption(option);
            } else {
                delete option.text;
                delete option.content_object_id;
            }
            result.push({
                id: option.id,
                content_object_id: option.content_object_id,
                text: option.text,
                Y: toDecimal(option.Y, false),
                A: toDecimal(option.A, false),
                N: toDecimal(option.N, false)
            });
        }
        return result;
    }

    private getElectronicOptions(pollOptions: any[]): any[] {
        const result: any[] = [];
        for (const option of pollOptions) {
            this.validateOption(option);
            result.push({
                content_object_id: option.content_object_id,
                text: option.text
            });
        }
        return result;
    }

    private validateOption(option: any): void {
        if ((option.text && option.content_object_id) || (!option.text && !option.content_object_id)) {
            throw new Error(`Exactly one of text or content_object_id has to be given!`);
        }
    }

    public async resetPoll(poll: Identifiable): Promise<void> {
        const payload: Identifiable = { id: poll.id };
        return this.sendActionToBackend(PollAction.RESET, payload);
    }

    public async anonymize(poll: Identifiable): Promise<void> {
        const payload: Identifiable = { id: poll.id };
        return this.sendActionToBackend(PollAction.ANONYMIZE, payload);
    }

    public async startPoll(poll: Identifiable): Promise<void> {
        const payload: Identifiable = { id: poll.id };
        return this.sendActionToBackend(PollAction.START, payload);
    }

    public async stopPoll(poll: Identifiable): Promise<void> {
        const payload: Identifiable = { id: poll.id };
        return this.sendActionToBackend(PollAction.STOP, payload);
    }

    public async publishPoll(poll: Identifiable): Promise<void> {
        const payload: Identifiable = { id: poll.id };
        return this.sendActionToBackend(PollAction.PUBLISH, payload);
    }

    public async updateOptionForPoll(poll: Poll, update: any): Promise<void> {
        if (poll.type !== PollType.Analog) {
            throw new Error(`Cannot update an option for an electronic poll!`);
        }
        const payload = {
            id: poll.id,
            Y: update.Y,
            N: update.N,
            A: update.A
        };
        return this.sendActionToBackend(PollAction.UPDATE_OPTION, payload);
    }

    public async vote(poll: Identifiable, options: any): Promise<void> {
        return this.voteRepo.sendVote(poll.id, options);
    }

    public async changePollState(poll: Identifiable, targetState: PollState): Promise<void> {
        switch (targetState) {
            case PollState.Created:
                await this.resetPoll(poll);
                break;
            case PollState.Started:
                await this.startPoll(poll);
                break;
            case PollState.Finished:
                await this.stopPoll(poll);
                break;
            case PollState.Published:
                return this.publishPoll(poll);
        }
    }

    protected override createViewModel(model: Poll): ViewPoll {
        const viewPoll = super.createViewModel(model);

        this.voteController.setHasVotedOnPoll(viewPoll).then(() => {});

        return viewPoll;
    }
}
