import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Vote } from 'src/app/domain/models/poll/vote';
import { HttpService } from 'src/app/gateways/http.service';
import { ViewPoll, ViewVote } from 'src/app/site/pages/meetings/pages/polls';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';

const VOTE_URL = `/system/vote`;
const HAS_VOTED_URL = `${VOTE_URL}/voted`;

/**
 * keys are poll ids,
 * the arrays contain the ids of the users that have voted for the corresponding polls
 */
export interface HasVotedResponse {
    [key: string]: Id[];
}

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
export class VoteRepositoryService extends BaseMeetingRelatedRepository<ViewVote, Vote> {
    private _subscribedPolls: Map<Id, PollSubscription> = new Map();

    // Interval for workaround until long polling implemented
    private _fetchVotablePollsInterval = null;
    private _fetchVotablePollsTimeout = null;

    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        private operator: OperatorService,
        private http: HttpService
    ) {
        super(repositoryServiceCollector, Vote);
    }

    public getTitle = (viewVote: object) => `Vote`;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Votes` : `Vote`);

    public override getFieldsets(): Fieldsets<Vote> {
        const detail: (keyof Vote)[] = [`delegated_user_id`, `option_id`, `user_id`, `value`, `weight`, `user_token`];
        return {
            [DEFAULT_FIELDSET]: detail
        };
    }

    public async sendVote(pollId: Id, payload: VotePayload): Promise<void> {
        const request: Promise<void> = this.http.post(`${VOTE_URL}?id=${pollId}`, payload);
        request.then(() => {
            this.updateSubscription();
        });

        return request;
    }

    /**
     * This method subscribes to polls and waits until the poll got
     * voted for or the poll finished
     *
     * @param poll The poll that should be subscribed
     * @return the ViewPoll
     */
    public subscribeVoted(poll: ViewPoll, userIds?: number[]): BehaviorSubject<Id[]> | null {
        if (!userIds || !userIds.length) {
            userIds = [this.operator.operatorId];
        }

        if (poll.isStarted) {
            if (!this._subscribedPolls.has(poll.id)) {
                this._subscribedPolls.set(poll.id, {
                    poll,
                    users: userIds,
                    current: new BehaviorSubject(undefined)
                });
                this.updateSubscription();
            }
        } else {
            if (this._subscribedPolls.has(poll.id)) {
                this._subscribedPolls.get(poll.id).current.complete();
                this._subscribedPolls.delete(poll.id);
            }

            return null;
        }

        return this._subscribedPolls.get(poll.id).current;
    }

    public updateStartedPolls(polls: Id[]): void {
        for (const id of this._subscribedPolls.keys()) {
            if (polls.indexOf(id) === -1) {
                this._subscribedPolls.get(id).current.complete();
                this._subscribedPolls.delete(id);
            }
        }
    }

    private updateSubscription(): void {
        clearTimeout(this._fetchVotablePollsTimeout);
        this._fetchVotablePollsTimeout = setTimeout(() => {
            this.requestHasVoted();
            clearInterval(this._fetchVotablePollsInterval);
            this._fetchVotablePollsInterval = setInterval(() => {
                if (this._subscribedPolls.size) {
                    this.requestHasVoted();
                } else {
                    clearInterval(this._fetchVotablePollsInterval);
                }
            }, 8000 + Math.random() * 2000);
        }, 500);
    }

    private async requestHasVoted(): Promise<void> {
        const ids = Array.from(this._subscribedPolls.keys()).filter(
            id =>
                !this._subscribedPolls.get(id).current.value ||
                !this._subscribedPolls.get(id).users.equals(this._subscribedPolls.get(id).current.value)
        );

        if (!this.activeMeetingId || !ids.length) {
            return;
        }

        let results: HasVotedResponse = await this.http.get(`${HAS_VOTED_URL}?ids=${ids.join()}`);
        for (let pollId of Object.keys(results)) {
            const subscription = this._subscribedPolls.get(+pollId);
            const currentVal = subscription.current.value;
            if (JSON.stringify(currentVal) !== JSON.stringify(results[pollId])) {
                subscription.current.next(results[pollId]);
            }
        }
    }
}
