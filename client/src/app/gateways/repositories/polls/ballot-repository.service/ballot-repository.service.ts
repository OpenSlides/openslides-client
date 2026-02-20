import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Ballot } from 'src/app/domain/models/poll/ballot';
import { HttpService } from 'src/app/gateways/http.service';
import { ViewBallot, ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';

const VOTE_URL = `/system/vote`;

/**
 * keys are poll ids,
 * the arrays contain the ids of the users that have voted for the corresponding polls
 */
export type HasVotedResponse = Record<string, Id[]>;

interface PollSubscription {
    poll: ViewPoll;
    users: Id[];
    current: BehaviorSubject<Id[]>;
}

export interface VotePayload {
    user_id: Id;
    value: any;
}

@Injectable({
    providedIn: `root`
})
export class BallotRepositoryService extends BaseMeetingRelatedRepository<ViewBallot, Ballot> {
    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        private operator: OperatorService,
        private http: HttpService
    ) {
        super(repositoryServiceCollector, Ballot);
    }

    public getTitle = (): string => `Vote`;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Votes` : `Vote`);

    public async sendVote(_pollId: Id, _payload: VotePayload): Promise<void> {
        // await this.http.post(`${VOTE_URL}?id=${pollId}`, payload);

        throw new Error(`Not implemented`);
    }

    /**
     * This method subscribes to polls and waits until the poll got
     * voted for or the poll finished
     *
     * @param poll The poll that should be subscribed
     * @return the ViewPoll
     */
    public subscribeVoted(_poll: ViewPoll, _userIds?: number[]): BehaviorSubject<Id[]> | null {
        throw new Error(`Not implemented`);
    }

    public updateStartedPolls(_polls: Id[]): void {
        throw new Error(`Not implemented`);
    }
}
