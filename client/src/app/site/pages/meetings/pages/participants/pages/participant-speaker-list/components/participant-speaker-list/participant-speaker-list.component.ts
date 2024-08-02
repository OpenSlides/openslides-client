import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { modelIcons } from 'src/app/domain/definitions/model-icons';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { GENDERS } from 'src/app/domain/models/users/user';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewSpeaker } from '../../../../../agenda';
import { SpeakerControllerService } from '../../../../../agenda/modules/list-of-speakers/services';
import { InteractionService } from '../../../../../interaction/services/interaction.service';
import { SpeakerCsvExportService } from '../../../../export/speaker-csv-export.service';
import { ParticipantSpeakerListFilterService } from '../../services/participant-speaker-list-filter.service/participant-speaker-list-filter.service';
import { ParticipantSpeakerListSortService } from '../../services/participant-speaker-list-sort.service/participant-speaker-list-sort.service';

const SPEAKERS_LIST_STORAGE_INDEX = `speakers`;

@Component({
    selector: `os-participant-speaker-list`,
    templateUrl: `./participant-speaker-list.component.html`,
    styleUrls: [`./participant-speaker-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantSpeakerListComponent extends BaseMeetingListViewComponent<ViewSpeaker> implements OnInit {
    public readonly SpeechState = SpeechState;

    /**
     * The list of all genders.
     */
    public genderList = GENDERS;

    public get structureLevelCountdownEnabled(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_default_structure_level_time`).pipe(map(v => v > 0));
    }

    /**
     * Define extra filter properties
     */
    public filterProps = [`name`, `structureLevelName`, `topic`];

    public get hasInteractionState(): Observable<boolean> {
        return this.interactionService.isConfStateNone.pipe(map(isNone => !isNone));
    }

    public constructor(
        protected override translate: TranslateService,
        public repo: SpeakerControllerService,
        public operator: OperatorService,
        public filterService: ParticipantSpeakerListFilterService,
        public sortService: ParticipantSpeakerListSortService,
        private csvExport: SpeakerCsvExportService,
        private interactionService: InteractionService
    ) {
        super();

        this.listStorageIndex = SPEAKERS_LIST_STORAGE_INDEX;
    }

    /**
     * Init function
     *
     * sets the title, inits the table, sets sorting and filter options, subscribes
     * to filter/sort services
     */
    public ngOnInit(): void {
        super.setTitle(`List of speakers`);
    }

    /**
     * Export all speakers currently matching the filter
     * as CSV
     */
    public csvExportSpeakerList(): void {
        this.csvExport.export(this.listComponent.source);
    }

    public getSpeakerIcon(speaker: ViewSpeaker): string {
        return modelIcons[speaker.contentType];
    }

    private getSpeakerContentType(speaker: ViewSpeaker): string {
        return speaker.contentType;
    }

    protected viewModelUrl(speaker: ViewSpeaker): string {
        if (this.getSpeakerContentType(speaker) === `topic`) {
            return `/${this.activeMeetingId}/agenda/topics/${speaker.contentSeqNum}`;
        } else if (this.getSpeakerContentType(speaker) === `motion`) {
            return `/${this.activeMeetingId}/motions/${speaker.contentSeqNum}`;
        } else if (this.getSpeakerContentType(speaker) === `motion_block`) {
            return `/${this.activeMeetingId}/motions/blocks/${speaker.contentSeqNum}`;
        } else if (this.getSpeakerContentType(speaker) === `assignment`) {
            return `/${this.activeMeetingId}/assignments/${speaker.contentSeqNum}`;
        }
        return `/${this.activeMeetingId}`;
    }
}
