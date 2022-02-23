import { Injectable } from '@angular/core';
import { PollAction } from 'app/core/actions/poll-action';
import { DEFAULT_FIELDSET, Fieldsets, ROUTING_FIELDSET } from 'app/core/core-services/model-request-builder.service';
import { SendVotesService } from 'app/core/core-services/send-votes.service';
import { Collection, Decimal, Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Poll } from 'app/shared/models/poll/poll';
import { PollState, PollType } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { toDecimal } from 'app/shared/utils/to-decimal';

import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

interface AnalogPollVotesValues {
    votescast: Decimal;
    votesvalid: Decimal;
    votesinvalid: Decimal;
}

interface AnalogPollGlobalValues {
    amount_global_yes: Decimal;
    amount_global_no: Decimal;
    amount_global_abstain: Decimal;
}

@Injectable({
    providedIn: `root`
})
export class PollRepositoryService extends BaseRepositoryWithActiveMeeting<ViewPoll, Poll> {
    public constructor(repoServiceCollector: RepositoryServiceCollector, private sendVotesService: SendVotesService) {
        super(repoServiceCollector, Poll);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Polls` : `Poll`);
    public getTitle = (viewModel: ViewPoll): string => viewModel.title;

    public getFieldsets(): Fieldsets<Poll> {
        const routingFields: (keyof Poll)[] = [`sequential_number`];
        const listFieldset: (keyof Poll)[] = [
            `entitled_group_ids`,
            `state`,
            `title`,
            `type`,
            `pollmethod`,
            `content_object_id`
        ];
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
            `max_votes_per_person`,
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

    public getViewModelListByContentObject(collection: Collection): ViewPoll[] {
        return this.getViewModelList().filter(_poll => _poll.content_object_id === collection);
    }

    public async create(
        poll: Partial<PollAction.CreateAnalogPollPayload | PollAction.CreateElectronicPollPayload>
    ): Promise<Id> {
        if (poll.type === PollType.Analog) {
            return this.createAnalogPoll(poll);
        } else {
            return this.createElectronicPoll(poll);
        }
    }

    public async update(
        update: Partial<PollAction.CreateAnalogPollPayload | PollAction.CreateElectronicPollPayload>,
        viewPoll: ViewPoll,
        option?: PollAction.OptionUpdatePayload[]
    ): Promise<void> {
        if (update.type === PollType.Analog) {
            return this.updateAnalogPoll(update, viewPoll, option);
        } else {
            return this.updateElectronicPoll(update, viewPoll);
        }
    }

    private async createAnalogPoll(poll: Partial<PollAction.CreateAnalogPollPayload>): Promise<Id> {
        const payload: PollAction.CreateAnalogPollPayload = {
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
            max_votes_per_person: poll.max_votes_per_person,
            min_votes_amount: poll.min_votes_amount,
            description: poll.description,
            options: this.getAnalogOptions(poll.options),
            content_object_id: poll.content_object_id,
            ...this.getAnalogPollVotesValues(poll),
            ...this.getAnalogPollGlobalValues(poll)
        };
        return this.sendActionToBackend(PollAction.CREATE, payload);
    }

    private async createElectronicPoll(poll: Partial<PollAction.CreateElectronicPollPayload>): Promise<Id> {
        const payload: PollAction.CreateElectronicPollPayload = {
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
            max_votes_per_person: poll.max_votes_per_person,
            description: poll.description,
            options: this.getElectronicOptions(poll.options),
            content_object_id: poll.content_object_id,
            entitled_group_ids: poll.entitled_group_ids,
            backend: poll.backend
        };
        return this.sendActionToBackend(PollAction.CREATE, payload);
    }

    private async updateAnalogPoll(
        update: Partial<PollAction.UpdateAnalogPollPayload>,
        poll: ViewPoll,
        option: PollAction.OptionUpdatePayload[]
    ): Promise<void> {
        let payload: PollAction.UpdateAnalogPollPayload | PollAction.UpdateOtherStateAnalogPollPayload;
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

    private async updateElectronicPoll(
        update: Partial<PollAction.UpdateElectronicPollPayload>,
        poll: Poll
    ): Promise<void> {
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

    public async delete(poll: Poll): Promise<void> {
        const payload: PollAction.DeletePollPayload = { id: poll.id };
        return this.sendActionToBackend(PollAction.DELETE, payload);
    }

    private getUpdateCreatedAnalogPollPayload(
        update: Partial<PollAction.UpdateAnalogPollPayload>,
        poll: Poll
    ): PollAction.UpdateAnalogPollPayload {
        const payload: PollAction.UpdateAnalogPollPayload = {
            id: poll.id,
            publish_immediately: update.publish_immediately,
            allow_multiple_votes_per_candidate: update.allow_multiple_votes_per_candidate,
            description: update.description,
            max_votes_amount: update.max_votes_amount,
            min_votes_amount: update.min_votes_amount,
            max_votes_per_person: update.max_votes_per_person,
            onehundred_percent_base: update.onehundred_percent_base,
            pollmethod: update.pollmethod,
            title: update.title,
            ...this.getAnalogPollVotesValues(update)
        };
        return payload;
    }

    private updateOtherStateAnalogPoll(
        update: Partial<PollAction.UpdateOtherStateAnalogPollPayload>,
        poll: Poll
    ): PollAction.UpdateOtherStateAnalogPollPayload {
        const payload: PollAction.UpdateOtherStateAnalogPollPayload = {
            id: poll.id,
            publish_immediately: update.publish_immediately,
            description: update.description,
            onehundred_percent_base: update.onehundred_percent_base,
            title: update.title,
            ...this.getAnalogPollVotesValues(update)
        };
        return payload;
    }

    private async updateCreatedElectronicPoll(
        update: Partial<PollAction.UpdateElectronicPollPayload>,
        poll: Poll
    ): Promise<void> {
        const payload: PollAction.UpdateElectronicPollPayload = {
            id: poll.id,
            entitled_group_ids: update.entitled_group_ids,
            allow_multiple_votes_per_candidate: update.allow_multiple_votes_per_candidate,
            description: update.description,
            max_votes_amount: update.max_votes_amount,
            min_votes_amount: update.min_votes_amount,
            max_votes_per_person: update.max_votes_per_person,
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
            votescast: toDecimal(poll.votescast),
            votesinvalid: toDecimal(poll.votesinvalid),
            votesvalid: toDecimal(poll.votesvalid)
        };
    }

    private getAnalogPollGlobalValues(poll: Partial<PollAction.CreateAnalogPollPayload>): AnalogPollGlobalValues {
        return {
            amount_global_abstain: toDecimal(poll.amount_global_abstain),
            amount_global_no: toDecimal(poll.amount_global_no),
            amount_global_yes: toDecimal(poll.amount_global_yes)
        };
    }

    private getAnalogOptions(
        pollOptions: any[],
        isUpdate: boolean = false
    ): (PollAction.AnalogOption & Identifiable)[] {
        const result: (PollAction.AnalogOption & Identifiable)[] = [];
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
                Y: toDecimal(option.Y),
                A: toDecimal(option.A),
                N: toDecimal(option.N)
            });
        }
        return result;
    }

    private getElectronicOptions(pollOptions: any[]): PollAction.ElectronicOption[] {
        const result: PollAction.ElectronicOption[] = [];
        for (const option of pollOptions) {
            this.validateOption(option);
            result.push({
                content_object_id: option.content_object_id,
                text: option.text
            });
        }
        return result;
    }

    private validateOption(option: PollAction.AnalogOption | PollAction.ElectronicOption): void {
        if ((option.text && option.content_object_id) || (!option.text && !option.content_object_id)) {
            throw new Error(`Exactly one of text or content_object_id has to be given!`);
        }
    }

    public async resetPoll(poll: Poll): Promise<void> {
        const payload: PollAction.ResetPollPayload = { id: poll.id };
        return this.sendActionToBackend(PollAction.RESET, payload);
    }

    public async anonymize(poll: Poll): Promise<void> {
        const payload: PollAction.AnonymizePollPayload = { id: poll.id };
        return this.sendActionToBackend(PollAction.ANONYMIZE, payload);
    }

    public async startPoll(poll: Poll): Promise<void> {
        const payload: PollAction.StartPollPayload = { id: poll.id };
        return this.sendActionToBackend(PollAction.START, payload);
    }

    public async stopPoll(poll: Poll): Promise<void> {
        const payload: PollAction.StopPollPayload = { id: poll.id };
        return this.sendActionToBackend(PollAction.STOP, payload);
    }

    public async publishPoll(poll: Poll): Promise<void> {
        const payload: PollAction.PublishPollPayload = { id: poll.id };
        return this.sendActionToBackend(PollAction.PUBLISH, payload);
    }

    public async updateOptionForPoll(poll: Poll, update: Partial<PollAction.OptionUpdatePayload>): Promise<void> {
        if (poll.type !== PollType.Analog) {
            throw new Error(`Cannot update an option for an electronic poll!`);
        }
        const payload: PollAction.OptionUpdatePayload = {
            id: poll.id,
            Y: update.Y,
            N: update.N,
            A: update.A
        };
        return this.sendActionToBackend(PollAction.UPDATE_OPTION, payload);
    }

    public async vote(
        poll: Poll,
        options: Partial<PollAction.YNVotePayload | PollAction.YNAVotePayload>
    ): Promise<void> {
        return this.sendVotesService.sendVote(poll.id, options);
    }

    public async changePollState(poll: Poll, targetState: PollState): Promise<void> {
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

    protected createViewModel(model: Poll): ViewPoll {
        const viewPoll = super.createViewModel(model);

        this.sendVotesService.setHasVotedOnPoll(viewPoll).then(() => {});

        return viewPoll;
    }
}
