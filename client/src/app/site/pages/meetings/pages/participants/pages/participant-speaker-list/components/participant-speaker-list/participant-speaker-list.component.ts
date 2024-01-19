import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { GENDERS } from 'src/app/domain/models/users/user';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
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

    /**
     * Helper to check for main button permissions
     *
     * @returns true if the user should be able to create users
     */
    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    /**
     * Define extra filter properties
     */
    public filterProps = [`name`, `structureLevelName`, `topic`];

    public get hasInteractionState(): Observable<boolean> {
        return this.interactionService.isConfStateNone.pipe(map(isNone => !isNone));
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        public repo: SpeakerControllerService,
        public operator: OperatorService,
        public filterService: ParticipantSpeakerListFilterService,
        public sortService: ParticipantSpeakerListSortService,
        private csvExport: SpeakerCsvExportService,
        private interactionService: InteractionService
    ) {
        super(componentServiceCollector, translate);

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
}
