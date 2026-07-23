import { inject, Service } from '@angular/core';
import {
    CsvColumnDefinitionMap,
    CsvColumnDefinitionProperty,
    CsvColumnsDefinition
} from '@app/gateways/export/csv-export.service';
import { DurationService } from '@app/site/services/duration.service';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { format, fromUnixTime } from 'date-fns';
import { DateFnsConfigurationService } from 'ngx-date-fns';

import { MeetingCsvExportForBackendService } from '../../../../services/export/meeting-csv-export-for-backend.service';
import { ViewSpeaker } from '../../../agenda';

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

@Service()
export class SpeakerCsvExportService {
    private csvExport = inject(MeetingCsvExportForBackendService);
    private translate = inject(TranslateService);
    private durationService = inject(DurationService);
    private dfnsConfig = inject(DateFnsConfigurationService);

    private columnMappings = {
        begin_time: (speaker: ViewSpeaker): string =>
            speaker.begin_time
                ? format(fromUnixTime(speaker.begin_time), `Ppp`, {
                      locale: this.dfnsConfig.locale()
                  })
                : ``,
        speakingTime: (speaker: ViewSpeaker): string => this.durationService.durationToString(speaker.speakingTime, ``)
    };

    public export(speakers: ViewSpeaker[]): void {
        this.csvExport.export(
            speakers,
            Object.keys(speakerHeadersAndVerboseNames).map(key => {
                if (this.columnMappings[key]) {
                    return {
                        map: speaker => this.columnMappings[key](speaker),
                        label: this.translate.instant(speakerHeadersAndVerboseNames[key])
                    } as CsvColumnDefinitionMap<ViewSpeaker>;
                }

                return {
                    property: key,
                    label: this.translate.instant(speakerHeadersAndVerboseNames[key])
                } as CsvColumnDefinitionProperty<ViewSpeaker>;
            }) as CsvColumnsDefinition<ViewSpeaker>,
            this.translate.instant(`Contributions`) + `.csv`
        );
    }
}
