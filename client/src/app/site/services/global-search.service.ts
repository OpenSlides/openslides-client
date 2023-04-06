import { Injectable } from '@angular/core';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { HttpService } from 'src/app/gateways/http.service';
import { collectionFromFqid, idFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';

export interface GlobalSearchEntry {
    title: string;
    text: string;
    fqid: string;
    url?: string;
}

@Injectable({
    providedIn: `root`
})
export class GlobalSearchService {
    public constructor(private http: HttpService, private activeMeeting: ActiveMeetingService) {}

    public async searchChange(
        searchTerm: string,
        collections: string[] = []
    ): Promise<{ [key: string]: GlobalSearchEntry[] }> {
        const rawResults: { [fqid: string]: any } = await this.http.get(`/system/search`, null, { q: searchTerm });
        let results = Object.keys(rawResults)
            .filter(fqid => {
                const collection = collectionFromFqid(fqid);
                return collections.includes(collection);
            })
            .map(fqid => this.getResult(fqid, rawResults[fqid]));

        let collectionMap: { [key: string]: GlobalSearchEntry[] } = {};
        for (let result of results) {
            const collection = collectionFromFqid(result.fqid);
            if (!collectionMap[collection]) {
                collectionMap[collection] = [];
            }

            collectionMap[collection].push(result);
        }

        return collectionMap;
    }

    private getResult(fqid: Fqid, content: any) {
        const collection = collectionFromFqid(fqid);
        const id = content.sequential_number || idFromFqid(fqid);
        let title = content.title || content.name;
        let text = content.text || content.description;
        let url = ``;

        switch (collection) {
            case `committee`:
                url = `/committees/${id}`;
                break;
            case `meeting`:
                url = `/${id}`;
                break;
            case `motion`:
                url = `/${content.meeting_id}/motions/${id}`;
                break;
            case `assignment`:
                url = `/${content.meeting_id}/assignments/${id}`;
                break;
            case `mediafile`:
                url = `/system/media/get/${id}`;
                break;
            case `user`:
                const firstName = content.first_name?.trim() || ``;
                const lastName = content.last_name?.trim() || ``;
                const userName = content.username?.trim() || ``;
                const name = firstName || lastName ? `${firstName} ${lastName}` : userName;
                title = name?.trim() || ``;
                if (this.activeMeeting.meetingId && content.meeting_ids?.includes(this.activeMeeting.meetingId)) {
                    url = `/${this.activeMeeting.meetingId}/participants/${id}`;
                } else {
                    url = `/accounts/${id}`;
                }
                break;
        }

        return {
            title,
            text,
            fqid,
            url
        };
    }
}
