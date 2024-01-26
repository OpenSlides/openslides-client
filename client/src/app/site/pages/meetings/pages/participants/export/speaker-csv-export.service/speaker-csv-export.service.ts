import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnDefinitionProperty, CsvColumnsDefinition } from 'src/app/gateways/export/csv-export.service';

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
    speakingTime: _(`Time`),
    topic: _(`Element`)
};

@Injectable({
    providedIn: ParticipantExportModule
})
export class SpeakerCsvExportService {
    public constructor(private csvExport: MeetingCsvExportForBackendService, private translate: TranslateService) {}

    public export(speakers: ViewSpeaker[]): void {
        this.csvExport.export(
            speakers,
            Object.keys(speakerHeadersAndVerboseNames).map(key => {
                return {
                    property: key,
                    label: this.translate.instant(speakerHeadersAndVerboseNames[key])
                } as CsvColumnDefinitionProperty<ViewSpeaker>;
            }) as CsvColumnsDefinition<ViewSpeaker>,
            this.translate.instant(`contributions`) + `.csv`
        );
    }
}
