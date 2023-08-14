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
    committee?: { id: Id; name: string };
    score?: number;
}

export interface GlobalSearchResponse {
    [fqid: string]: { content: any; score: number; fragments: { [field: string]: string } };
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

        const rawResults: GlobalSearchResponse = await this.http.get(`/system/search`, null, params);

        this.updateScores(rawResults);
        this.parseFragments(rawResults);

        return Object.keys(rawResults)
            .filter(fqid => {
                const collection = collectionFromFqid(fqid);
                return collections.includes(collection) || !collections.length;
            })
            .map(fqid => this.getResult(fqid, rawResults))
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Moves the match markers from the fragments into the content.
     * This is required because html tags within search results are
     * converted to html special characters.
     */
    private parseFragments(results: GlobalSearchResponse): void {
        for (const fqid of Object.keys(results)) {
            const result = results[fqid];
            for (const field of Object.keys(result.fragments)) {
                if (result.content[field]) {
                    for (const fragment of result.fragments[field]) {
                        const marks = fragment.matchAll(/<mark>(.*?)<\/mark>/g);
                        for (const mark of marks) {
                            result.content[field] = (<string>result.content[field]).replace(
                                new RegExp(mark[1], `g`),
                                mark[0]
                            );
                        }
                    }
                }
            }
        }
    }

    private updateScores(results: GlobalSearchResponse): void {
        for (let fqid of Object.keys(results)) {
            this.updateScore(fqid, results[fqid].score || 0, results);
        }
    }

    /**
     * Recursively updates the scores of related search results to match
     * their parents
     */
    private updateScore(fqid: string, addScore: number, results: GlobalSearchResponse): void {
        const collection = collectionFromFqid(fqid);
        const result = results[fqid];
        if (collection === `tag` && results[fqid].content?.tagged_ids) {
            for (let taggedFqid of results[fqid].content?.tagged_ids) {
                results[taggedFqid].score = Math.max(results[taggedFqid].score || 0, addScore);
                this.updateScore(taggedFqid, results[taggedFqid].score, results);
            }
        } else if (collection === `agenda_item` && result.content?.content_object_id) {
            results[result.content.content_object_id].score = Math.max(
                results[result.content.content_object_id].score || 0,
                addScore
            );

            this.updateScore(
                result.content.content_object_id,
                results[result.content.content_object_id].score,
                results
            );
        }
    }

    private getResult(fqid: Fqid, results: GlobalSearchResponse) {
        const content = results[fqid].content;
        const collection = collectionFromFqid(fqid);
        const id = content.sequential_number || idFromFqid(fqid);

        return {
            title: this.getTitle(collection, content),
            text: content.text || content.description,
            fqid,
            collection,
            url: this.getUrl(collection, id, content),
            meeting: results[`meeting/${content.meeting_id}`]?.content,
            committee: results[`committee/${content.committee_id}`]?.content,
            score: results[fqid].score || 0
        };
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
