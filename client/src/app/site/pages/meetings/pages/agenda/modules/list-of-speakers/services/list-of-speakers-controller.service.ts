import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { ListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/list-of-speakers/list-of-speakers-repository.service';
import { BaseController } from 'src/app/site/base/base-controller';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';

import { ViewStructureLevel } from '../../../../participants/pages/structure-levels/view-models';
import { ViewListOfSpeakers, ViewSpeaker } from '../view-models';

/**
 * An object, that contains information about
 * speaking-time and finished-speakers.
 * Helpful to get a relation between speakers and their structure-level.
 */
export interface SpeakingTimeStructureLevelObject {
    finishedSpeakers: ViewSpeaker[];
    speakingTime: number;
    name: string;
}

@Injectable({
    providedIn: `root`
})
export class ListOfSpeakersControllerService extends BaseController<ViewListOfSpeakers, ListOfSpeakers> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: ListOfSpeakersRepositoryService,
        private meetingSettings: MeetingSettingsService
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
        const mapForAggregation = new Map<Id, SpeakingTimeStructureLevelObject>();
        const parliamentMode = this.meetingSettings.instant(`list_of_speakers_default_structure_level_time`);
        for (const los of this.getViewModelList()) {
            for (const speaker of los.finishedSpeakers) {
                if (parliamentMode) {
                    const structureLevelOrNull = speaker.structure_level_list_of_speakers?.structure_level;
                    this.putIntoMapForAggregation(structureLevelOrNull, speaker, mapForAggregation);
                } else {
                    for (const structureLevel of speaker.user?.structure_levels() ?? []) {
                        this.putIntoMapForAggregation(structureLevel, speaker, mapForAggregation);
                    }
                    if (!(speaker.user?.structure_levels() ?? []).length) {
                        this.putIntoMapForAggregation(null, speaker, mapForAggregation);
                    }
                }
            }
        }
        return Array.from(mapForAggregation.values());
    }

    private putIntoMapForAggregation(
        structureLevel: ViewStructureLevel | null,
        speaker: ViewSpeaker,
        mapForAggregation: Map<Id, SpeakingTimeStructureLevelObject>
    ): void {
        let structureLevelId = -1;
        if (structureLevel) {
            structureLevelId = structureLevel.id;
        }
        if (mapForAggregation.has(structureLevelId)) {
            const entry = mapForAggregation.get(structureLevelId);
            entry.finishedSpeakers.push(speaker);
            entry.speakingTime += this.getSpeakingTimeAsNumber(speaker);
        } else {
            mapForAggregation.set(structureLevelId, {
                finishedSpeakers: [speaker],
                speakingTime: this.getSpeakingTimeAsNumber(speaker),
                name: structureLevelId === -1 ? _(`without structure level`) : structureLevel.name
            });
        }
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
