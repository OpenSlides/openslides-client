import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import {
    CsvColumnDefinitionMap,
    CsvColumnDefinitionProperty,
    CsvColumnsDefinition
} from 'src/app/gateways/export/csv-export.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { MeetingCsvExportForBackendService } from '../../../../services/export/meeting-csv-export-for-backend.service';
import { participantColumns } from '../../pages/participant-import/definitions';
import { ParticipantExportModule } from '../participant-export.module';
import { participantsExportExample } from '../participants-export-example';

export interface ParticipantExport extends UserExport {
    comment?: string;
    is_present_in_meeting_ids?: string | boolean;
    group_ids?: string;
    locked_out?: boolean;
}

@Injectable({
    providedIn: ParticipantExportModule
})
export class ParticipantCsvExportService {
    // private _csvColumnDefinitionMapsMap: Map<string, CsvColumnDefinitionMap<ViewUser>> = new Map([
    //     [
    //         `group_ids`,
    //         {
    //             label: `Groups`,
    //             map: user =>
    //                 user
    //                     .groups()
    //                     .map(group => group.name)
    //                     .join(`,`)
    //         }
    //     ],
    //     [
    //         `is_present_in_meeting_ids`,
    //         {
    //             label: `Is present`,
    //             map: user => (user.isPresentInMeeting() ? `1` : ``)
    //         }
    //     ]
    // ]);

    public constructor(
        private csvExport: MeetingCsvExportForBackendService,
        private translate: TranslateService
    ) {}

    public export(participants: ViewUser[]): void {
        this.csvExport.export(
            participants,
            participantColumns.map(key => {
                if (key === `locked_out`) {
                    return {
                        label: `locked_out`,
                        map: user => (user.is_locked_out ? `1` : ``)
                    } as CsvColumnDefinitionMap<ViewUser>;
                }
                return {
                    property: key
                } as CsvColumnDefinitionProperty<ViewUser>;
            }) as CsvColumnsDefinition<ViewUser>,
            this.translate.instant(`Participants`) + `.csv`
        );
    }

    public exportCsvExample(): void {
        const rows: UserExport[] = participantsExportExample;
        this.csvExport.dummyCSVExport<UserExport>(
            participantColumns,
            rows,
            `${this.translate.instant(`participants-example`)}.csv`
        );
    }
}
