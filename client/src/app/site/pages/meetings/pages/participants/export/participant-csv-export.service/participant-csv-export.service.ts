import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import {
    CsvColumnDefinitionMap,
    CsvColumnDefinitionProperty,
    CsvColumnsDefinition
} from 'src/app/gateways/export/csv-export.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

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
        private activeMeeting: ActiveMeetingService,
        private organization: OrganizationService,
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

    /**
     * @returns participants csv-example with added 'groups' and 'gender' values.
     * Groups:
     * - 2 custom group (not default or admin) names separated by comma by default
     * - 1 custom group name if meeting has only 1 custom group
     * - default group name if meeting has no custom groups
     */
    private provideExampleRow(): UserExport[] {
        const meeting: ViewMeeting = this.activeMeeting.meeting;
        const organization: ViewOrganization = this.organization.organization;
        const row: UserExport[] = participantsExportExample;

        let groupsToExport: string;
        const customGroupNames = meeting.groups.filter(group => {
            return !group.isAdminGroup && !group.isDefaultGroup;
        });

        if (!customGroupNames.length) {
            groupsToExport = meeting.default_group.name;
        } else {
            groupsToExport = customGroupNames
                .slice(0, 2)
                .map(group => group.name)
                .join(`, `);
        }

        row[0][`groups`] = groupsToExport;
        row[0][`gender`] = organization.genders[0].name;

        return row;
    }

    public exportCsvExample(): void {
        const row: UserExport[] = this.provideExampleRow();
        this.csvExport.dummyCSVExport<UserExport>(
            participantColumns,
            row,
            `${this.translate.instant(`participants-example`)}.csv`
        );
    }
}
