import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { GENDER_FITLERABLE, GENDERS } from 'src/app/domain/models/users/user';
import { OsFilter, OsHideFilterSetting } from 'src/app/site/base/base-filter.service';
import { BaseMeetingFilterListService } from 'src/app/site/pages/meetings/base/base-meeting-filter-list.service';
import { MeetingActiveFiltersService } from 'src/app/site/pages/meetings/services/meeting-active-filters.service';

import { ViewSpeaker } from '../../../../../agenda';
import { StructureLevelControllerService } from '../../../structure-levels/services/structure-level-controller.service';
import { ParticipantSpeakerListServiceModule } from '../participant-speaker-list-service.module';

@Injectable({
    providedIn: ParticipantSpeakerListServiceModule
})
export class ParticipantSpeakerListFilterService extends BaseMeetingFilterListService<ViewSpeaker> {
    /**
     * set the storage key name
     */
    protected storageKey = `SpeakerList`;

    private speakerStructureLevelFilterOptions: OsFilter<ViewSpeaker> = {
        property: `structureLevelId`,
        label: `Structure level`,
        options: []
    };

    public constructor(
        store: MeetingActiveFiltersService,
        structureRepo: StructureLevelControllerService,
        private translate: TranslateService
    ) {
        super(store);

        this.updateFilterForRepo({
            repo: structureRepo,
            filter: this.speakerStructureLevelFilterOptions,
            noneOptionLabel: this.translate.instant(`No structure level`)
        });
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewSpeaker>[] {
        const staticFilterOptions: OsFilter<ViewSpeaker>[] = [
            {
                property: `gender`,
                label: this.translate.instant(`Gender`),
                options: [
                    { condition: GENDER_FITLERABLE[0], label: this.translate.instant(GENDERS[0]) },
                    { condition: GENDER_FITLERABLE[1], label: this.translate.instant(GENDERS[1]) },
                    { condition: GENDER_FITLERABLE[2], label: this.translate.instant(GENDERS[2]) },
                    { condition: GENDER_FITLERABLE[3], label: this.translate.instant(GENDERS[3]) },
                    { condition: null, label: this.translate.instant(`not specified`) }
                ]
            },
            {
                property: `speech_state`,
                label: this.translate.instant(`Speech type`),
                options: [
                    { condition: SpeechState.PRO, label: this.translate.instant(`Forspeech`) },
                    { condition: SpeechState.CONTRA, label: this.translate.instant(`Contra speech`) },
                    { condition: SpeechState.CONTRIBUTION, label: this.translate.instant(`Contribution`) },
                    { condition: SpeechState.INTERVENTION, label: this.translate.instant(`Intervention`) },
                    {
                        condition: SpeechState.INTERPOSED_QUESTION,
                        label: this.translate.instant(`Interposed question`)
                    },
                    { condition: null, label: this.translate.instant(`not specified`) }
                ]
            },
            {
                property: `contentType`,
                label: this.translate.instant(`Module`),
                options: [
                    { condition: `topic`, label: this.translate.instant(`Agenda`) },
                    { condition: `motion`, label: this.translate.instant(`Motions`) },
                    { condition: `motion_block`, label: this.translate.instant(`Motion blocks`) },
                    { condition: `assignment`, label: this.translate.instant(`Elections`) }
                ]
            },
            {
                property: `hasSpoken`,
                label: this.translate.instant(`Spoken`),
                options: [
                    { condition: true, label: this.translate.instant(`Has spoken`) },
                    { condition: [false, null], label: this.translate.instant(`Has not spoken`) }
                ]
            }
        ];
        return staticFilterOptions.concat(this.speakerStructureLevelFilterOptions);
    }

    protected override getHideFilterSettings(): OsHideFilterSetting<ViewSpeaker>[] {
        return [];
    }
}
