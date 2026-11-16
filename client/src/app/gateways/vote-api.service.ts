import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';

import { Id } from '../domain/definitions/key-types';
import { PollVisibility } from '../domain/models/poll/poll-constants';
import { HttpService } from './http.service';

export interface PollCreatePayload extends PollUpdatePayload {
    content_object_id: string;
    meeting_id: Id;
}

export interface PollUpdatePayload {
    title: string;
    method: string;
    method_config: unknown;
    visibility: PollVisibility;
    entitled_group_ids?: Id[];
    live_voting_enabled?: boolean;
    options?: (number | string)[];
    option_type?: 'text' | 'meeting_user';
    result?: unknown;
    allow_vote_split: boolean;
    allow_empty?: boolean;
}

@Service()
export class VoteApiService {
    private readonly BASE = '/system/vote';

    private http = inject(HttpService);

    public create(payload: PollCreatePayload): Promise<Identifiable> {
        return this.http.post(`${this.BASE}/poll`, payload);
    }

    public update(id: Id, payload: Partial<PollUpdatePayload>): Promise<void> {
        return this.http.post(`${this.BASE}/poll/${encodeURIComponent(id)}`, payload);
    }

    public deletePoll(id: Id): Promise<void> {
        return this.http.delete(`${this.BASE}/poll/${encodeURIComponent(id)}`, {});
    }

    public start(id: Id): Promise<void> {
        return this.http.post(
            `${this.BASE}/poll/${encodeURIComponent(id)}/start`,
            {},
            {
                catchError: false
            }
        );
    }

    public finalize(id: Id, options?: { publish?: boolean; anonymize?: boolean }): Promise<void> {
        const url = `${this.BASE}/poll/${encodeURIComponent(id)}/finalize`;
        const queryParams: Record<string, string> = {};
        if (options?.publish) {
            queryParams[`publish`] = ``;
        }
        if (options?.anonymize) {
            queryParams[`anonymize`] = ``;
        }
        return this.http.post(url, {}, { queryParams, catchError: false });
    }

    public reset(id: Id): Promise<void> {
        return this.http.post(
            `${this.BASE}/poll/${encodeURIComponent(id)}/reset`,
            {},
            {
                catchError: false
            }
        );
    }

    public vote(id: Id, value: unknown, meetingUserId: Id, split = false): Promise<void> {
        return this.http.post(
            `${this.BASE}/poll/${encodeURIComponent(id)}/vote`,
            {
                meeting_user_id: meetingUserId,
                value,
                split
            },
            {
                catchError: false
            }
        );
    }
}
