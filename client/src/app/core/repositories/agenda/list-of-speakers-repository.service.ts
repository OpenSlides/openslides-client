import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * An object, that contains information about structure-level,
 * speaking-time and finished-speakers.
 * Helpful to get a relation between speakers and their structure-level.
 */
export interface SpeakingTimeStructureLevelObject {
    structureLevel: string;
    finishedSpeakers: ViewSpeaker[];
    speakingTime: number;
}

/**
 * Repository service for lists of speakers
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class ListOfSpeakersRepositoryService extends BaseRepository<ViewListOfSpeakers, ListOfSpeakers> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, ListOfSpeakers);
    }

    public getFieldsets(): Fieldsets<ListOfSpeakers> {
        return { [DEFAULT_FIELDSET]: ['closed', 'content_object_id', 'speaker_ids'] };
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Lists of speakers' : 'List of speakers');
    };

    public getTitle = (viewListOfSpeakers: ViewListOfSpeakers) => {
        if (viewListOfSpeakers.content_object) {
            return viewListOfSpeakers.content_object.getListOfSpeakersTitle();
        }
    };

    /**
     * Add a new speaker to a list of speakers.
     * Sends the users id to the server
     *
     * @param userId {@link User} id of the new speaker
     * @param listOfSpeakers the target agenda item
     */
    public async createSpeaker(listOfSpeakers: ViewListOfSpeakers, userId: number): Promise<Identifiable> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        // return await this.httpService.post<Identifiable>(restUrl, { user: userId });
        throw new Error('TODO');
    }

    /**
     * Removes the given speaker for the list of speakers
     *
     * @param listOfSpeakers the target list of speakers
     * @param speakerId (otional) the speakers id. If no id is given, the speaker with the
     * current operator is removed.
     */
    public async delete(listOfSpeakers: ViewListOfSpeakers, speakerId?: number): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        // await this.httpService.delete(restUrl, speakerId ? { speaker: speakerId } : null);
        throw new Error('TODO');
    }

    /**
     * Deletes all speakers of the given list of speakers.
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async deleteAllSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        // await this.httpService.delete(restUrl, { speaker: listOfSpeakers.speakers.map(speaker => speaker.id) });
        throw new Error('TODO');
    }

    /**
     * Posts an (manually) sorted speaker list to the server
     *
     * @param listOfSpeakers the target list of speakers, which speaker-list is changed.
     * @param speakerIds array of speaker id numbers
     */
    public async sortSpeakers(listOfSpeakers: ViewListOfSpeakers, speakerIds: number[]): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'sort_speakers');
        // await this.httpService.post(restUrl, { speakers: speakerIds });
        throw new Error('TODO');
    }

    /**
     * Readds the last speaker to the list of speakers
     *
     * @param listOfSpeakers the list of speakers to modify
     */
    public async readdLastSpeaker(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'readd_last_speaker');
        // await this.httpService.post(restUrl);
        throw new Error('TODO');
    }

    /**
     * Marks all speakers for a given user
     *
     * @param userId {@link User} id of the user
     * @param marked determine if the user should be marked or not
     * @param listOfSpeakers the target list of speakers
     */
    public async markSpeaker(listOfSpeakers: ViewListOfSpeakers, speaker: ViewSpeaker, marked: boolean): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'manage_speaker');
        // await this.httpService.patch(restUrl, { user: speaker.user.id, marked: marked });
        throw new Error('TODO');
    }

    /**
     * Stops the current speaker
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async stopCurrentSpeaker(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'speak');
        // await this.httpService.delete(restUrl);
        throw new Error('TODO');
    }

    /**
     * Sets the given speaker id to speak
     *
     * @param speakerId the speakers id
     * @param listOfSpeakers the target list of speakers
     */
    public async startSpeaker(listOfSpeakers: ViewListOfSpeakers, speaker: ViewSpeaker): Promise<void> {
        const restUrl = this.getRestUrl(listOfSpeakers.id, 'speak');
        // await this.httpService.put(restUrl, { speaker: speaker.id });
        throw new Error('TODO');
    }

    public async deleteAllSpeakersOfAllListsOfSpeakers(): Promise<void> {
        // await this.httpService.post('/rest/agenda/list-of-speakers/delete_all_speakers/');
        throw new Error('TODO');
    }

    public isFirstContribution(speaker: ViewSpeaker): boolean {
        return !this.getViewModelList().some(list => list.hasSpeakerSpoken(speaker));
    }

    /**
     * List every speaker only once, who has spoken
     *
     * @returns A list with all different speakers.
     */
    public getAllFirstContributions(): ViewSpeaker[] {
        const speakers: ViewSpeaker[] = this.getViewModelList().flatMap(
            (los: ViewListOfSpeakers) => los.finishedSpeakers
        );
        const firstContributions: ViewSpeaker[] = [];
        for (const speaker of speakers) {
            if (!firstContributions.find(s => s.user_id === speaker.user_id)) {
                firstContributions.push(speaker);
            }
        }
        return firstContributions;
    }

    /**
     * Maps structure-level to speaker.
     *
     * @returns A list, which entries are `SpeakingTimeStructureLevelObject`.
     */
    public getSpeakingTimeStructureLevelRelation(): SpeakingTimeStructureLevelObject[] {
        let listSpeakingTimeStructureLevel: SpeakingTimeStructureLevelObject[] = [];
        for (const los of this.getViewModelList()) {
            for (const speaker of los.finishedSpeakers) {
                const nextEntry = this.getSpeakingTimeStructureLevelObject(speaker);
                listSpeakingTimeStructureLevel = this.getSpeakingTimeStructureLevelList(
                    nextEntry,
                    listSpeakingTimeStructureLevel
                );
            }
        }
        return listSpeakingTimeStructureLevel;
    }

    /**
     * Helper-function to create a `SpeakingTimeStructureLevelObject` by a given speaker.
     *
     * @param speaker, with whom structure-level and speaking-time is calculated.
     *
     * @returns The created `SpeakingTimeStructureLevelObject`.
     */
    private getSpeakingTimeStructureLevelObject(speaker: ViewSpeaker): SpeakingTimeStructureLevelObject {
        return {
            structureLevel:
                !speaker.user || (speaker.user && !speaker.user.structure_level) ? '–' : speaker.user.structure_level,
            finishedSpeakers: [speaker],
            speakingTime: this.getSpeakingTimeAsNumber(speaker)
        };
    }

    /**
     * Helper-function to update entries in a given list, if already existing, or create entries otherwise.
     *
     * @param object A `SpeakingTimeStructureLevelObject`, that contains information about speaking-time
     * and structure-level.
     * @param list A list, at which speaking-time, structure-level and finished_speakers are set.
     *
     * @returns The updated map.
     */
    private getSpeakingTimeStructureLevelList(
        object: SpeakingTimeStructureLevelObject,
        list: SpeakingTimeStructureLevelObject[]
    ): SpeakingTimeStructureLevelObject[] {
        const index = list.findIndex(entry => entry.structureLevel === object.structureLevel);
        if (index >= 0) {
            list[index].speakingTime += object.speakingTime;
            list[index].finishedSpeakers.push(...object.finishedSpeakers);
        } else {
            list.push(object);
        }
        return list;
    }

    /**
     * This function calculates speaking-time as number for a given speaker.
     *
     * @param speaker The speaker, whose speaking-time should be calculated.
     *
     * @returns A number, that represents the speaking-time.
     */
    private getSpeakingTimeAsNumber(speaker: ViewSpeaker): number {
        return Math.floor((new Date(speaker.end_time).valueOf() - new Date(speaker.begin_time).valueOf()) / 1000);
    }

    /**
     * Helper function get the url to the speaker rest address
     *
     * @param listOfSpeakersId id of the list of speakers
     * @param method the desired speaker action
     */
    private getRestUrl(
        listOfSpeakersId: number,
        method: 'manage_speaker' | 'sort_speakers' | 'speak' | 'readd_last_speaker'
    ): string {
        return `/rest/agenda/list-of-speakers/${listOfSpeakersId}/${method}/`;
    }
}
