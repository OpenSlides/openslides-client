import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnDefinitionProperty, CsvColumnsDefinition } from 'src/app/gateways/export/csv-export.service';

import { MeetingCsvExportForBackendService } from '../../../../services/export/meeting-csv-export-for-backend.service';
import { ViewSpeaker } from '../../../agenda';
import { ParticipantExportModule } from '../participant-export.module';

export const speakerHeadersAndVerboseNames = {
    name: `Speaker name`,
    structureLevelName: `Structure level`,
    speech_state: `Speech state`,
    speakingTime: `Duration`,
    topic: `Title`
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
                    property: key
                } as CsvColumnDefinitionProperty<ViewSpeaker>;
            }) as CsvColumnsDefinition<ViewSpeaker>,
            this.translate.instant(`Speakers`) + `.csv`
        );
    }
}
