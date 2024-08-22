import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { CsvColumnDefinitionProperty, CsvColumnsDefinition } from 'src/app/gateways/export/csv-export.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { MeetingCsvExportForBackendService } from '../../../../services/export/meeting-csv-export-for-backend.service';
import { participantColumns } from '../../pages/participant-import/definitions';
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
                return {
                    property: key
                } as CsvColumnDefinitionProperty<ViewUser>;
            }) as CsvColumnsDefinition<ViewUser>,
            this.translate.instant(`Participants`) + `.csv`
        );
    }

    /**
     * Translates values of the given columns in example file
     * to the currently used lang.
     */
    public translateSelectedCSVRows(rows: UserExport[], columns: string[]): UserExport[] {
        rows.map(row => {
            for (let column of columns) {
                row[column] = this.translate.instant(row[column]);
            }
        })
        return rows;
    }

    public exportCsvExample(): void {
        const rows: UserExport[] = participantsExportExample;
        const columnsToTranslate: string[] = [`groups`, `gender`];
        const translatedRows: UserExport[] = this.translateSelectedCSVRows(rows, columnsToTranslate);

        this.csvExport.dummyCSVExport<UserExport>(
            participantColumns,
            translatedRows,
            `${this.translate.instant(`participants-example`)}.csv`
        );
    }
}
