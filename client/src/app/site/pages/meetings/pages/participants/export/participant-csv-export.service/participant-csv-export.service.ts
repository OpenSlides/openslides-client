import { Injectable } from '@angular/core';
import { ParticipantExportModule } from '../participant-export.module';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { CsvExportService } from 'src/app/gateways/export/csv-export.service';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { participantsExportExample } from '../participants-export-example';
import { PARTICIPANT_HEADERS_AND_VERBOSE_NAMES } from '../../pages/participant-import/definitions/index';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

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
                { property: `vote_weight`, label: `Vote weight` }
            ],
            _(`Participants`) + `.csv`
        );
    }

    public exportCsvExample(): void {
        const rows: UserExport[] = participantsExportExample;
        this.csvExport.dummyCSVExport<UserExport>(
            PARTICIPANT_HEADERS_AND_VERBOSE_NAMES,
            rows,
            `${_(`participants-example`)}.csv`
        );
    }
}
