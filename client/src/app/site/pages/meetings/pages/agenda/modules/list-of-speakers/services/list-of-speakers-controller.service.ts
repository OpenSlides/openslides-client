import { Injectable } from '@angular/core';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { ListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/list-of-speakers/list-of-speakers-repository.service';
import { BaseController } from 'src/app/site/base/base-controller';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';

import { ViewListOfSpeakers, ViewSpeaker } from '../view-models';

/**
 * An object, that contains information about
 * speaking-time and finished-speakers.
 * Helpful to get a relation between speakers and their structure-level.
 */
export interface SpeakingTimeStructureLevelObject {
    finishedSpeakers: ViewSpeaker[];
    speakingTime: number;
}

@Injectable({
    providedIn: `root`
})
export class ListOfSpeakersControllerService extends BaseController<ViewListOfSpeakers, ListOfSpeakers> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: ListOfSpeakersRepositoryService
    ) {
        super(controllerServiceCollector, ListOfSpeakers, repo);
    }

    public readdLastSpeaker(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        return this.repo.readdLastSpeaker(listOfSpeakers);
    }

    public setClosed(isClosed: boolean, ...relatedModels: BaseViewModel[]): Promise<void> {
        return this.repo.setClosed(isClosed, ...relatedModels);
    }

    public deleteAllSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        return this.repo.deleteAllSpeakers(listOfSpeakers);
    }

    public deleteAllNextSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        return this.repo.deleteAllNextSpeakers(listOfSpeakers);
    }

    public deleteAllPreviousSpeakers(listOfSpeakers: ViewListOfSpeakers): Promise<void> {
        return this.repo.deleteAllPreviousSpeakers(listOfSpeakers);
    }

    public isFirstContribution(speaker: ViewSpeaker): boolean {
        return !this.getViewModelList().some(list => list.hasUserSpoken(speaker.meeting_user_id));
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
        list.push(object);
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
        return Math.floor(new Date(speaker.end_time).valueOf() - new Date(speaker.begin_time).valueOf());
    }
}
