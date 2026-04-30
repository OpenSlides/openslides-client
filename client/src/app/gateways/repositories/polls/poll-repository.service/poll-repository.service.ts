import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, takeWhile } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollState, PollVisibility } from 'src/app/domain/models/poll/poll-constants';
import { PollCreatePayload, PollUpdatePayload, VoteApiService } from 'src/app/gateways/vote-api.service';
import { ViewBallot, ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { Fieldsets } from 'src/app/site/services/model-request-builder';

import { Identifiable } from '../../../../domain/interfaces/identifiable';
import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { PollAction } from './poll.action';

@Injectable({
    providedIn: `root`
})
export class PollRepositoryService extends BaseMeetingRelatedRepository<ViewPoll, Poll> {
    private voteApi = inject(VoteApiService);

    public constructor(repoServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repoServiceCollector, Poll);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Polls` : `Poll`);
    public getTitle = (viewModel: ViewPoll): string => viewModel.title;

    public override getFieldsets(): Fieldsets<Poll> {
        const listFieldset: (keyof Poll)[] = [
            `sequential_number`,
            `meeting_id`,
            `entitled_group_ids`,
            `state`,
            `title`,
            `visibility`,
            `content_object_id`,
            `config_id`
        ];
        return {
            ...super.getFieldsets(),
            list: listFieldset
        };
    }

    public async create(poll: PollCreatePayload): Promise<Identifiable> {
        if (poll.visibility === PollVisibility.Manually) {
            return this.createAnalogPoll(poll);
        }

        return this.createElectronicPoll(poll);
    }

    public async update(poll: ViewPoll, payload: PollUpdatePayload): Promise<void> {
        if (payload.visibility === PollVisibility.Manually) {
            return this.updateAnalogPoll(poll.id, payload);
        }

        return this.updateElectronicPoll(poll, payload);
    }

    private async createAnalogPoll(_poll: any): Promise<Identifiable> {
        /*
        const payload = {
            meeting_id: this.activeMeetingId,
            title: poll.title,
            publish_immediately: poll.publish_immediately,
            type: poll.type,
            global_abstain: poll.global_abstain,
            global_no: poll.global_no,
            global_yes: poll.global_yes,
            options: this.getAnalogOptions(poll.options),
            content_object_id: poll.content_object_id,
            ...this.getAnalogPollVotesValues(poll),
            ...this.getAnalogPollGlobalValues(poll)
        };
        return this.sendActionToBackend(PollAction.CREATE, payload);
        */
        throw new Error(`not implemented`);
    }

    private async createElectronicPoll(payload: PollCreatePayload): Promise<Identifiable> {
        if (payload.visibility !== PollVisibility.Named) {
            delete payload.live_voting_enabled;
        }

        return this.voteApi.create(payload);
    }

    private async updateAnalogPoll(_pollId: Id, _payload: PollUpdatePayload): Promise<void> {
        /*
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
        */
        throw new Error(`not implemented`);
    }

    private async updateElectronicPoll(poll: ViewPoll, payload: PollUpdatePayload): Promise<void> {
        if (poll.config.METHOD_NAME === payload.method) {
            delete payload[`method`];
        }

        return this.voteApi.update(poll.id, payload);
    }

    public async delete(poll: Identifiable): Promise<void> {
        return this.voteApi.deletePoll(poll.id);
    }

    /**
     * This method subscribes to polls and waits until the poll got
     * voted for or the poll finished
     *
     * @param poll The poll that should be subscribed
     * @return the ViewPoll
     */
    public pollBallotsByUser(pollId: Id, meetingUserId: number): Observable<ViewBallot[]> {
        return this.getViewModelObservable(pollId).pipe(
            takeWhile(poll => poll.state === PollState.Started),
            switchMap(poll => poll.ballots$),
            map(ballots => ballots.filter(b => b.represented_meeting_user_id === meetingUserId))
        );
    }

    public async resetPoll(poll: Identifiable): Promise<void> {
        return this.voteApi.reset(poll.id);
    }

    public async anonymize(poll: Identifiable, publish?: boolean): Promise<void> {
        return this.voteApi.finalize(poll.id, {
            anonymize: true,
            publish
        });
    }

    public async startPoll(poll: Identifiable): Promise<void> {
        return this.voteApi.start(poll.id);
    }

    public async stopPoll(poll: Identifiable): Promise<void> {
        return this.voteApi.finalize(poll.id, {
            publish: false
        });
    }

    public async publishPoll(poll: Identifiable): Promise<void> {
        return this.voteApi.finalize(poll.id, {
            publish: true
        });
    }

    public async updateOptionForPoll(poll: Poll, update: any): Promise<void> {
        if (!poll.isAnalog) {
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
        }
    }
}
