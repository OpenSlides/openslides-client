import { Injectable } from '@angular/core';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { Motion } from 'src/app/domain/models/motions';
import { MotionChangeRecommendation } from 'src/app/domain/models/motions/motion-change-recommendation';
import { HttpService } from 'src/app/gateways/http.service';
import {
    collectionFromFqid,
    collectionIdFromFqid,
    fqidFromCollectionAndId,
    idFromFqid
} from 'src/app/infrastructure/utils/transform-functions';

import { ActiveMeetingService } from '../../pages/meetings/services/active-meeting.service';
import { GlobalSearchEntry, GlobalSearchResponse, GlobalSearchResponseEntry } from './definitions';

@Injectable({
    providedIn: `root`
})
export class GlobalSearchService {
    public constructor(private http: HttpService, private activeMeeting: ActiveMeetingService) {}

    public async searchChange(
        searchTerm: string,
        reqCollections: string[] = [],
        collections: string[] = [],
        meeting?: Id
    ): Promise<{ resultList: GlobalSearchEntry[]; models: GlobalSearchResponse }> {
        if (!searchTerm) {
            return { resultList: [], models: {} };
        }

        const params: { q: string; c?: string; m?: string } = { q: searchTerm };
        if (meeting) {
            params.m = meeting.toString();
        }
        if (reqCollections && reqCollections.length) {
            params.c = reqCollections.join(`,`);
        }

        const rawResults: GlobalSearchResponse = await this.http.get(`/system/search`, null, { queryParams: params });

        this.updateScores(rawResults);
        this.parseFragments(rawResults, searchTerm);

        return {
            resultList: Object.keys(rawResults)
                .filter(fqid => {
                    const collection = collectionFromFqid(fqid);
                    return collections.includes(collection) || !collections.length;
                })
                .map(fqid => this.getResult(fqid, rawResults))
                .filter(r => r.score > 0)
                .sort((a, b) => b.score - a.score),
            models: rawResults
        };
    }

    public getTitle(collection: string, content: any): string {
        if (collection === `user`) {
            const firstName = content.first_name?.trim() || ``;
            const lastName = content.last_name?.trim() || ``;
            const userName = content.username?.trim() || ``;
            const name = firstName || lastName ? `${firstName} ${lastName}` : userName;
            return `${content.title?.trim() || ``} ${name?.trim()}`.trim() || ``;
        }

        return content.title || content.name;
    }

    /**
     * Searches the content for search matches and replaces them with markers
     */
    private parseFragments(results: GlobalSearchResponse, originalSearchTerm: string): void {
        for (const fqid of Object.keys(results)) {
            const result = results[fqid];
            if (result.matched_by) {
                for (const field of Object.keys(result.matched_by)) {
                    if (result.content[field] && !this.isIdField(field)) {
                        for (const word of result.matched_by[field]) {
                            if (result.content[field] instanceof String) {
                                result.content[field] = result.content[field]
                                    .replace(
                                        new RegExp(originalSearchTerm, `gi`),
                                        (match: string) => `<mark>${match}</mark>`
                                    )
                                    .replace(new RegExp(word, `gi`), (match: string) => `<mark>${match}</mark>`);
                            } else {
                                // Generic way to parse matches in amendments. This might needs
                                // improvement
                                try {
                                    result.content[field] = JSON.parse(
                                        JSON.stringify(result.content[field])
                                            .replace(
                                                new RegExp(originalSearchTerm, `gi`),
                                                (match: string) => `<mark>${match}</mark>`
                                            )
                                            .replace(new RegExp(word, `gi`), match => `<mark>${match}</mark>`)
                                    );
                                } catch (e) {}
                            }
                        }
                    }
                }
            }
        }
    }

    private isTitleField(collection: string, field: string): boolean {
        if (collection === `user`) {
            return [`first_name`, `last_name`, `username`, `title`].includes(field);
        } else {
            return [`name`, `title`].includes(field);
        }
    }

    private isIdField(field: string): boolean {
        return [`owner_id`, `content_object_id`].indexOf(field) !== -1;
    }

    private updateScores(results: GlobalSearchResponse): void {
        for (const fqid of Object.keys(results)) {
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
            for (const taggedFqid of results[fqid].content?.tagged_ids) {
                results[taggedFqid].score = Math.max(results[taggedFqid].score || 0, addScore);

                this.updateMatchedByFqids(fqid, taggedFqid, results);
                this.updateScore(taggedFqid, results[taggedFqid].score, results);
            }
        } else if ([`agenda_item`, `poll`].indexOf(collection) !== -1 && result.content?.content_object_id) {
            results[result.content.content_object_id].score = Math.max(
                results[result.content.content_object_id].score || 0,
                addScore
            );

            this.updateMatchedByFqids(fqid, result.content.content_object_id, results);
            this.updateScore(
                result.content.content_object_id,
                results[result.content.content_object_id].score,
                results
            );
        } else if (collection === `motion_change_recommendation` && results[fqid].content?.motion_id) {
            const motionFqid = fqidFromCollectionAndId(Motion.COLLECTION, results[fqid].content?.motion_id);
            results[motionFqid].score = Math.max(results[motionFqid].score || 0, addScore);

            this.updateMatchedByFqids(fqid, motionFqid, results);
            this.updateScore(motionFqid, results[motionFqid].score, results);
        }
    }

    private updateMatchedByFqids(fqid: string, addToFqid: string, results: GlobalSearchResponse): void {
        if (!results[addToFqid].matched_by_fqids) {
            results[addToFqid].matched_by_fqids = [];
        }
        results[addToFqid].matched_by_fqids.push(fqid);
    }

    private getResult(fqid: Fqid, results: GlobalSearchResponse) {
        const content = results[fqid].content;
        const collection = collectionFromFqid(fqid);
        const id = content.sequential_number || idFromFqid(fqid);
        let meeting = null;
        if (content.meeting_id) {
            meeting = results[`meeting/${content.meeting_id}`]?.content;
        } else if (content.owner_id && content.owner_id.startsWith(`meeting`)) {
            meeting = results[content.owner_id]?.content;
        }

        return {
            title: this.getTitle(collection, content),
            text: this.getText(collection, results[fqid], results),
            obj: content,
            fqid,
            collection,
            url: this.getUrl(collection, id, content),
            meeting,
            committee: results[`committee/${content.committee_id}`]?.content,
            score: results[fqid].score || 0
        };
    }

    private getText(collection: string, result: GlobalSearchResponseEntry, results: GlobalSearchResponse): string {
        const content = result.content;
        if (
            collection === Motion.COLLECTION &&
            result.matched_by &&
            !result.matched_by[`text`] &&
            result.matched_by[`reason`]
        ) {
            return content.reason;
        } else if (result.matched_by_fqids && (!result.matched_by || !Object.keys(result.matched_by).length)) {
            for (const fqid of result.matched_by_fqids) {
                const mColl = collectionFromFqid(fqid);
                if (mColl === MotionChangeRecommendation.COLLECTION) {
                    const text = this.getText(mColl, results[fqid], results);
                    if (text) {
                        return text;
                    }
                }
            }
        }

        return content.text || content.description;
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
                if (content?.is_directory) {
                    const [coll, mid] = collectionIdFromFqid(content.owner_id);
                    if (coll === Meeting.COLLECTION) {
                        return `/${mid}/mediafiles/${id}`;
                    }
                    return `/mediafiles/${id}`;
                }
                return `/system/media/get/${id}`;
            case `user`:
                if (this.activeMeeting.meetingId && content.meeting_ids?.includes(this.activeMeeting.meetingId)) {
                    return `/${this.activeMeeting.meetingId}/participants/${id}`;
                }

                return `/accounts/${id}`;
        }
        return `/`;
    }
}
