import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import {
    CsvColumnDefinitionMap,
    CsvColumnDefinitionProperty,
    CsvColumnsDefinition
} from 'src/app/gateways/export/csv-export.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { MeetingCsvExportService } from '../../../../services/export';
import { participantHeadersAndVerboseNames } from '../../pages/participant-import/definitions';
import { ParticipantExportModule } from '../participant-export.module';
import { participantsExportExample } from '../participants-export-example';

export interface ParticipantExport extends UserExport {
    comment?: string;
    is_present_in_meeting_ids?: string | boolean;
    group_ids?: string;
}

@Injectable({
    providedIn: ParticipantExportModule
})
export class ParticipantCsvExportService {
    private _csvColumnDefinitionMapsMap: Map<string, CsvColumnDefinitionMap<ViewUser>> = new Map([
        [
            `group_ids`,
            {
                label: `Groups`,
                map: user =>
                    user
                        .groups()
                        .map(group => group.name)
                        .join(`,`)
            }
        ],
        [
            `is_present_in_meeting_ids`,
            {
                label: `Is present`,
                map: user => (user.isPresentInMeeting() ? `1` : ``)
            }
        ]
    ]);

    public constructor(private csvExport: MeetingCsvExportService, private translate: TranslateService) {}

    public export(participants: ViewUser[]): void {
        this.csvExport.export(
            participants,
            Object.keys(participantHeadersAndVerboseNames).map(key => {
                const map = this._csvColumnDefinitionMapsMap.get(key);
                if (map) {
                    return map;
                }
                return {
                    property: key,
                    label: participantHeadersAndVerboseNames[key]
                } as CsvColumnDefinitionProperty<ViewUser>;
            }) as CsvColumnsDefinition<ViewUser>,
            this.translate.instant(`Participants`) + `.csv`
        );
    }

    public exportCsvExample(): void {
        const rows: UserExport[] = participantsExportExample;
        this.csvExport.dummyCSVExport<UserExport>(
            participantHeadersAndVerboseNames,
            rows,
            `${this.translate.instant(`participants-example`)}.csv`
        );
    }
}
