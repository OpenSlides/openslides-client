import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Vote } from 'src/app/domain/models/poll/vote';
import { HttpService } from 'src/app/gateways/http.service';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { ViewVote } from 'src/app/site/pages/meetings/pages/polls';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';

const VOTE_URL = `/system/vote`;
const HAS_VOTED_URL = `${VOTE_URL}/voted`;

export interface HasVotedResponse {
    [key: string]: boolean;
}

export interface HasVotedResponseCache {
    [key: string]: {
        hasVoted: boolean;
        invalidateTimeout: any;
    };
}

@Injectable({
    providedIn: `root`
})
export class VoteRepositoryService extends BaseMeetingRelatedRepository<ViewVote, Vote> {
    private _hasVotedCache: HasVotedResponseCache = {};
    private _nextRequestIds: Set<Id> = new Set<Id>();
    private _requestHasVotedPromise: Deferred<void>;

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
        if (!ids.length) {
            return undefined;
        }

        const result = this.getIdsFromCache(ids);
        if (ids.some(id => !!result[id])) {
            return result;
        } else {
            for (let id of ids) {
                this._nextRequestIds.add(id);
            }

            await this.requestHasVoted();
        }

        return this.getIdsFromCache(ids);
    }

    private requestHasVoted(): Deferred<void> {
        if (this._requestHasVotedPromise) {
            return this._requestHasVotedPromise;
        }

        const def = new Deferred();
        this._requestHasVotedPromise = def;
        setTimeout(async () => {
            this._requestHasVotedPromise = null;

            let results: HasVotedResponse = await this.http.get(
                `${HAS_VOTED_URL}?ids=${Array.from(this._nextRequestIds).join()}`
            );
            for (let id in results) {
                clearTimeout(this._hasVotedCache[id]?.invalidateTimeout);
                this._hasVotedCache[id] = {
                    hasVoted: results[id],
                    invalidateTimeout: setTimeout(() => {
                        delete this._hasVotedCache[id];
                    }, 1000)
                };
            }
            def.resolve();
        }, 50);

        return this._requestHasVotedPromise;
    }

    private getIdsFromCache(ids: Id[]): HasVotedResponse {
        return Object.fromEntries(
            Object.entries(this._hasVotedCache)
                .map(v => [v[0], v[1].hasVoted])
                .filter(entry => ids.includes(+entry[0]))
        );
    }
}
