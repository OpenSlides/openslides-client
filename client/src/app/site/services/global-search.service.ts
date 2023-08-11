import { Injectable } from '@angular/core';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { HttpService } from 'src/app/gateways/http.service';
import { collectionFromFqid, idFromFqid } from 'src/app/infrastructure/utils/transform-functions';

import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';

export interface GlobalSearchEntry {
    title: string;
    text: string;
    fqid: string;
    collection: string;
    url?: string;
    meeting?: { id: Id; name: string };
    score?: number;
}

@Injectable({
    providedIn: `root`
})
export class GlobalSearchService {
    public constructor(private http: HttpService, private activeMeeting: ActiveMeetingService) {}

    public async searchChange(
        searchTerm: string,
        collections: string[] = [],
        meeting?: Id
    ): Promise<GlobalSearchEntry[]> {
        const params: { q: string; m?: string } = { q: searchTerm };
        if (meeting) {
            params.m = meeting.toString();
        }

        const rawResults: { [fqid: string]: { content: any; score: number } } = await this.http.get(
            `/system/search`,
            null,
            params
        );
        return Object.keys(rawResults)
            .filter(fqid => {
                const collection = collectionFromFqid(fqid);
                return collections.includes(collection) || !collections.length;
            })
            .map(fqid => this.getResult(fqid, rawResults))
            .sort((a, b) => b.score - a.score);
    }

    private getResult(fqid: Fqid, results: { [fqid: string]: any }) {
        const content = results[fqid].content;
        const collection = collectionFromFqid(fqid);
        const id = content.sequential_number || idFromFqid(fqid);

        return {
            title: this.getTitle(collection, content),
            text: content.text || content.description,
            fqid,
            collection,
            url: this.getUrl(collection, id, content),
            meeting: this.getMeeting(collection, content, results),
            score: results[fqid].score || 0
        };
    }

    private getMeeting(_collection: string, content: any, results: { [fqid: string]: any }) {
        if (content.meeting_id) {
            return results[`meeting/${content.meeting_id}`].content;
        }

        return undefined;
    }

    private getTitle(collection: string, content: any) {
        if (collection === `user`) {
            const firstName = content.first_name?.trim() || ``;
            const lastName = content.last_name?.trim() || ``;
            const userName = content.username?.trim() || ``;
            const name = firstName || lastName ? `${firstName} ${lastName}` : userName;
            return name?.trim() || ``;
        }

        return content.title || content.name;
    }

    private getUrl(collection: string, id: Id, content: any): string {
        switch (collection) {
            case `committee`:
                return `/committees/${id}`;
            case `meeting`:
                return `/${id}`;
            case `motion`:
                return `/${content.meeting_id}/motions/${id}`;
            case `assignment`:
                return `/${content.meeting_id}/assignments/${id}`;
            case `topic`:
                return `/${content.meeting_id}/agenda/topics/${id}`;
            case `mediafile`:
                return `/system/media/get/${id}`;
            case `user`:
                // TODO: Needs update to work with rtf
                if (this.activeMeeting.meetingId && content.meeting_ids?.includes(this.activeMeeting.meetingId)) {
                    return `/${this.activeMeeting.meetingId}/participants/${id}`;
                }

                return `/accounts/${id}`;
        }
        return `/`;
    }
}
