import { Injectable } from '@angular/core';

import { Id } from '../domain/definitions/key-types';
import { PollVisibility } from '../domain/models/poll';
import { HttpService } from './http.service';

export interface PollCreatePayload {
    title: string;
    description?: string;
    content_object_id: string;
    meeting_id: Id;
    method: string;
    config: unknown;
    visibility: PollVisibility;
    entitled_group_ids?: Id[];
    live_voting_enabled?: boolean;
    result?: unknown;
    allow_vote_split: boolean;
}

@Injectable({ providedIn: 'root' })
export class VoteApiService {
    private readonly BASE = '/system/vote';

    public constructor(private http: HttpService) {}

    public create(payload: PollCreatePayload): Promise<any> {
        return this.http.post(`${this.BASE}/poll`, payload);
    }

    public update(id: Id, payload: any): Promise<any> {
        return this.http.post(`${this.BASE}/poll/${encodeURIComponent(id)}`, payload);
    }

    public deletePoll(id: Id): Promise<any> {
        return this.http.delete(`${this.BASE}/poll/${encodeURIComponent(id)}`, {});
    }

    public start(id: Id): Promise<any> {
        return this.http.post(`${this.BASE}/poll/${encodeURIComponent(id)}/start`, {});
    }

    public finalize(id: Id, options?: { publish?: boolean; anonymize?: boolean }): Promise<any> {
        const url = `${this.BASE}/poll/${encodeURIComponent(id)}/finalize`;
        const queryParams: Record<string, any> = {};
        if (options?.publish) {
            queryParams[`publish`] = ``;
        }
        if (options?.anonymize) {
            queryParams[`anonymize`] = ``;
        }
        return this.http.post(url, {}, { queryParams });
    }

    public reset(id: Id): Promise<any> {
        return this.http.post(`${this.BASE}/poll/${encodeURIComponent(id)}/reset`, {});
    }

    public vote(id: Id, payload: any): Promise<any> {
        return this.http.post(`${this.BASE}/poll/${encodeURIComponent(id)}/vote`, payload);
    }
}
