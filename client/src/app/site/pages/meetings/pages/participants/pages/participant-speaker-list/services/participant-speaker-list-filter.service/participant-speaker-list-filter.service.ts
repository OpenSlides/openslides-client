import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { GENDER_FITLERABLE, GENDERS } from 'src/app/domain/models/users/user';
import { BaseFilterListService, OsFilter, OsHideFilterSetting } from 'src/app/site/base/base-filter.service';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

import { SpeechWaitingState, ViewSpeaker } from '../../../../../agenda';
import { StructureLevelControllerService } from '../../../structure-levels/services/structure-level-controller.service';
import { ParticipantSpeakerListServiceModule } from '../participant-speaker-list-service.module';

@Injectable({
    providedIn: ParticipantSpeakerListServiceModule
})
export class ParticipantSpeakerListFilterService extends BaseFilterListService<ViewSpeaker> {
    /**
     * set the storage key name
     */
    protected storageKey = `SpeakerList`;

    private speakerStructureLevelFilterOptions: OsFilter<ViewSpeaker> = {
        property: `structureLevelId`,
        label: `Structure level`,
        options: []
    };

    public constructor(store: ActiveFiltersService, structureRepo: StructureLevelControllerService) {
        super(store);

        this.updateFilterForRepo({
            repo: structureRepo,
            filter: this.speakerStructureLevelFilterOptions,
            noneOptionLabel: _(`No structure level`)
        });
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewSpeaker>[] {
        const staticFilterOptions: OsFilter<ViewSpeaker>[] = [
            {
                property: `gender`,
                label: _(`Gender`),
                options: [
                    { condition: GENDER_FITLERABLE[0], label: GENDERS[0] },
                    { condition: GENDER_FITLERABLE[1], label: GENDERS[1] },
                    { condition: GENDER_FITLERABLE[2], label: GENDERS[2] },
                    { condition: GENDER_FITLERABLE[3], label: GENDERS[3] },
                    { condition: null, label: _(`not specified`) }
                ]
            },
            {
                property: `speech_state`,
                label: _(`Speech type`),
                options: [
                    { condition: SpeechState.PRO, label: _(`Forspeech`) },
                    { condition: SpeechState.CONTRA, label: _(`Contra speech`) },
                    { condition: SpeechState.CONTRIBUTION, label: _(`Contribution`) },
                    { condition: SpeechState.INTERVENTION, label: _(`Intervention`) },
                    {
                        condition: SpeechState.INTERPOSED_QUESTION,
                        label: _(`Interposed question`)
                    },
                    { condition: null, label: _(`not specified`) }
                ]
            },
            {
                property: `contentType`,
                label: _(`Module`),
                options: [
                    { condition: `topic`, label: _(`Agenda`) },
                    { condition: `motion`, label: _(`Motions`) },
                    { condition: `motion_block`, label: _(`Motion blocks`) },
                    { condition: `assignment`, label: _(`Elections`) }
                ]
            },
            {
                property: `hasSpoken`,
                label: _(`Speaker`),
                options: [
                    { condition: SpeechWaitingState.FINISHED, label: _(`Has spoken`) },
                    { condition: SpeechWaitingState.STARTED, label: _(`Is speaking`) },
                    { condition: SpeechWaitingState.WAITING, label: _(`Has not spoken`) }
                ]
            }
        ];
        return staticFilterOptions.concat(this.speakerStructureLevelFilterOptions);
    }

    protected override getHideFilterSettings(): OsHideFilterSetting<ViewSpeaker>[] {
        return [];
    }
}
