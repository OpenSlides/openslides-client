import { Injectable } from '@angular/core';
import { ListOfSpeakersAction } from 'app/core/actions/list-of-speakers-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { hasListOfSpeakers, ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { BaseViewModel } from 'app/site/base/base-view-model';

import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
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
    providedIn: `root`
})
export class ListOfSpeakersRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewListOfSpeakers,
    ListOfSpeakers
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, ListOfSpeakers);
    }

    public getFieldsets(): Fieldsets<ListOfSpeakers> {
        const defaultFieldset: (keyof ListOfSpeakers)[] = [`closed`, `content_object_id`, `speaker_ids`];
        return {
            [DEFAULT_FIELDSET]: defaultFieldset
        };
    }

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? `Lists of speakers` : `List of speakers`);

    public getTitle = (viewListOfSpeakers: ViewListOfSpeakers) => {
        if (viewListOfSpeakers.content_object) {
            return viewListOfSpeakers.content_object.getListOfSpeakersTitle();
        }
    };

    /**
     * Sets the closed attribute for one or many List Of Speakers
     * Extracts the ViewListOfSpeakers from BaseViewModel automatically if they contain any.
     * Offers a lot of convinience since closing the a List Of Speakers is required in many differnent
     * contexts
     *
     * @param closed Open or close the ListOfSpeakers
     * @param modelObjects Can be either ViewListOfSpeakers or BaseViewModels with list of speakers
     * @returns void
     */
    public async setClosed(closed: boolean, ...modelObjects: ViewListOfSpeakers[] | BaseViewModel[]): Promise<void> {
        const payload = modelObjects.map((model: ViewListOfSpeakers | BaseViewModel) => {
            let los: ViewListOfSpeakers;
            if (model instanceof ViewListOfSpeakers) {
                los = model;
            } else if (hasListOfSpeakers(model)) {
                los = model.list_of_speakers;
            }
            return { id: los.id, closed: closed };
        });

        return await this.sendBulkActionToBackend(ListOfSpeakersAction.UPDATE, payload);
    }

    /**
     * Deletes all speakers of the given list of speakers.
     *
     * @param listOfSpeakers the target list of speakers
     */
    public async deleteAllSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const payload: ListOfSpeakersAction.DeleteAllSpeakersPayload = {
            id: listOfSpeakers.id
        };
        return await this.sendActionToBackend(ListOfSpeakersAction.DELETE_ALL_SPEAKERS, payload);
    }

    /**
     * Readds the last speaker to the list of speakers
     *
     * @param listOfSpeakers the list of speakers to modify
     */
    public async readdLastSpeaker(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        const payload: ListOfSpeakersAction.ReAddLastPayload = {
            id: listOfSpeakers.id
        };
        return await this.sendActionToBackend(ListOfSpeakersAction.RE_ADD_LAST_SPEAKER, payload);
    }

    public isFirstContribution(speaker: ViewSpeaker): boolean {
        return !this.getViewModelList().some(list => list.hasSpeakerSpoken(speaker));
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
                !speaker.user || (speaker.user && !speaker.user.structure_level())
                    ? `–`
                    : speaker.user.structure_level(),
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
}
