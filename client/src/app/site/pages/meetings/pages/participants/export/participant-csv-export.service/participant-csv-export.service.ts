import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { CsvExportService } from 'src/app/gateways/export/csv-export.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

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
    public constructor(private csvExport: CsvExportService, private translate: TranslateService) {}

    public export(participants: ViewUser[]): void {
        this.csvExport.export(
            participants,
            [
                { property: `title` },
                { property: `first_name`, label: `Given name` },
                { property: `last_name`, label: `Surname` },
                { property: `structure_level`, label: `Structure level` },
                { property: `number`, label: `Participant number` },
                {
                    label: `groups`,
                    map: user =>
                        user
                            .groups()
                            .map(group => group.name)
                            .join(`,`)
                },
                { property: `comment` },
                { property: `is_active`, label: `Is active` },
                { property: `is_present_in_meetings`, label: `Is present in meeting` },
                { property: `is_physical_person`, label: `Is a natural person` },
                { property: `default_password`, label: `Initial password` },
                { property: `email` },
                { property: `username` },
                { property: `gender` },
                { property: `vote_weight`, label: `Vote weight` },
                { property: `pronoun`, label: `Pronoun` }
            ],
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
