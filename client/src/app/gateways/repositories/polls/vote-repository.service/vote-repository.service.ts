import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Vote } from 'src/app/domain/models/poll/vote';
import { HttpService } from 'src/app/gateways/http.service';
import { ViewVote } from 'src/app/site/pages/meetings/pages/polls';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

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

@Injectable({
    providedIn: `root`
})
export class VoteRepositoryService extends BaseMeetingRelatedRepository<ViewVote, Vote> {
    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
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

    public async sendVote(pollId: Id, payload: any): Promise<void> {
        return await this.http.post(`${VOTE_URL}?id=${pollId}`, payload);
    }

    public async hasVotedFor(...ids: Id[]): Promise<HasVotedResponse | undefined> {
        if (ids.length) {
            return await this.http.get(`${HAS_VOTED_URL}?ids=${ids.join()}`);
        }
        return undefined;
    }
}
