import { Injectable } from '@angular/core';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewUser } from 'app/site/users/models/view-user';

import { PollAction } from '../actions/poll-action';
import { Id } from '../definitions/key-types';
import { HttpService } from './http.service';

const VOTE_URL = `/system/vote`;
const HAS_VOTED_URL = `${VOTE_URL}/voted`;

export interface HasVotedResponse {
    [key: string]: boolean;
}

@Injectable({
    providedIn: `root`
})
export class SendVotesService {
    public constructor(private http: HttpService) {}

    public async sendVote(
        pollId: Id,
        payload: Partial<PollAction.YNVotePayload | PollAction.YNAVotePayload>
    ): Promise<void> {
        return await this.http.post(`${VOTE_URL}?id=${pollId}`, payload);
    }

    private async hasVotedFor(...ids: Id[]): Promise<HasVotedResponse> | undefined {
        if (ids.length) {
            return await this.http.get(`${HAS_VOTED_URL}?ids=${ids.join()}`);
        }
    }

    public async setHasVotedOnPoll(...viewPolls: ViewPoll[]): Promise<void> {
        const pollIds: Id[] = viewPolls.map(poll => poll.id);
        const voteResp = await this.hasVotedFor(...pollIds);

        if (voteResp) {
            for (const poll of viewPolls) {
                poll.hasVoted = voteResp[poll.id];
            }
        }
    }
}
