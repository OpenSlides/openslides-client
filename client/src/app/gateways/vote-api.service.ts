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
        return this.http.post(`${this.BASE}/create`, payload);
    }

    public update(id: Id, payload: any): Promise<any> {
        return this.http.post(`${this.BASE}/update?id=${encodeURIComponent(id)}`, payload);
    }

    public deletePoll(id: Id): Promise<any> {
        return this.http.post(`${this.BASE}/delete?id=${encodeURIComponent(id)}`, {});
    }

    public start(id: Id): Promise<any> {
        return this.http.post(`${this.BASE}/start?id=${encodeURIComponent(id)}`, {});
    }

    public finalize(id: Id, options?: { publish?: boolean; anonymize?: boolean }): Promise<any> {
        let url = `${this.BASE}/finalize?id=${encodeURIComponent(id)}`;
        if (options?.publish) {
            url += '&publish';
        }
        if (options?.anonymize) {
            url += '&anonymize';
        }
        return this.http.post(url, {});
    }

    public reset(id: Id): Promise<any> {
        return this.http.post(`${this.BASE}/reset?id=${encodeURIComponent(id)}`, {});
    }

    public vote(payload: any): Promise<any> {
        return this.http.post(`${this.BASE}`, payload);
    }
}
