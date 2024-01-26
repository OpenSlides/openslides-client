import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { format, fromUnixTime } from 'date-fns';
import { DateFnsConfigurationService } from 'ngx-date-fns';
import {
    CsvColumnDefinitionMap,
    CsvColumnDefinitionProperty,
    CsvColumnsDefinition
} from 'src/app/gateways/export/csv-export.service';
import { DurationService } from 'src/app/site/services/duration.service';

import { MeetingCsvExportForBackendService } from '../../../../services/export/meeting-csv-export-for-backend.service';
import { ViewSpeaker } from '../../../agenda';
import { ParticipantExportModule } from '../participant-export.module';

export const speakerHeadersAndVerboseNames = {
    user_title: _(`Title`),
    user_first_name: _(`Given name`),
    user_last_name: _(`Surname`),
    structureLevelName: _(`Structure level`),
    user_number: _(`Participant number`),
    speech_state: _(`Speech type`),
    begin_time: _(`Start time`),
    speakingTime: _(`Duration`),
    topic: _(`Element`)
};

@Injectable({
    providedIn: ParticipantExportModule
})
export class SpeakerCsvExportService {
    public constructor(
        private csvExport: MeetingCsvExportForBackendService,
        private translate: TranslateService,
        private durationService: DurationService,
        private dfnsConfig: DateFnsConfigurationService
    ) {}

    private col_begin_time(speaker: ViewSpeaker): string {
        return speaker.begin_time
            ? format(fromUnixTime(speaker.begin_time), `Ppp`, {
                  locale: this.dfnsConfig.locale()
              })
            : ``;
    }

    private col_speakingTime(speaker: ViewSpeaker): string {
        return this.durationService.durationToString(speaker.speakingTime, ``);
    }

    public export(speakers: ViewSpeaker[]): void {
        this.csvExport.export(
            speakers,
            Object.keys(speakerHeadersAndVerboseNames).map(key => {
                if (this[`col_` + key]) {
                    return {
                        map: speaker => this[`col_` + key](speaker),
                        label: this.translate.instant(speakerHeadersAndVerboseNames[key])
                    } as CsvColumnDefinitionMap<ViewSpeaker>;
                }

                return {
                    property: key,
                    label: this.translate.instant(speakerHeadersAndVerboseNames[key])
                } as CsvColumnDefinitionProperty<ViewSpeaker>;
            }) as CsvColumnsDefinition<ViewSpeaker>,
            this.translate.instant(`lists_of_speakers`) + `.csv`
        );
    }
}
