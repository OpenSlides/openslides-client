import { inject, Injectable } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Poll } from '@app/domain/models/poll/poll';
import { PollState, PollVisibility } from '@app/domain/models/poll/poll-constants';
import { PollCreatePayload, PollUpdatePayload, VoteApiService } from '@app/gateways/vote-api.service';
import { ViewPoll, ViewPollBallot } from '@app/site/pages/meetings/pages/polls';
import { Fieldsets } from '@app/site/services/model-request-builder';
import { map, Observable, switchMap, takeWhile } from 'rxjs';

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
            return this.updateAnalogPoll(poll, payload);
        }

        return this.updateElectronicPoll(poll, payload);
    }

    private async createAnalogPoll(payload: any): Promise<Identifiable> {
        delete payload.live_voting_enabled;

        return this.voteApi.create(payload);
    }

    private async createElectronicPoll(payload: PollCreatePayload): Promise<Identifiable> {
        if (payload.visibility !== PollVisibility.Named && payload.visibility !== PollVisibility.Open) {
            delete payload.live_voting_enabled;
        }

        return this.voteApi.create(payload);
    }

    private async updateAnalogPoll(poll: ViewPoll, payload: PollUpdatePayload): Promise<void> {
        if (poll.config.METHOD_NAME === payload.method) {
            delete payload[`method`];
        }

        return this.voteApi.update(poll.id, payload);
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
    public pollBallotsByUser(pollId: Id, meetingUserId: number): Observable<ViewPollBallot[]> {
        return this.getViewModelObservable(pollId).pipe(
            takeWhile(poll => poll?.state === PollState.Started),
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
        if (poll.visibility !== PollVisibility.Manually) {
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
