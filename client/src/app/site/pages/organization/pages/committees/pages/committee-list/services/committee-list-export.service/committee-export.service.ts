import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnsDefinition } from 'src/app/gateways/export/csv-export.service';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';

import { ViewCommittee } from '../../../../view-models/view-committee';
import { CommitteeListServiceModule } from '../committee-list-service.module';

@Injectable({
    providedIn: CommitteeListServiceModule
})
export class CommitteeExportService {
    public constructor(
        private translate: TranslateService,
        private csvExport: CsvExportForBackendService,
        private meetingRepo: MeetingControllerService
    ) {}

    public export(committees: ViewCommittee[]): void {
        const properties: CsvColumnsDefinition<ViewCommittee> = [
            {
                property: `name`
            },
            {
                property: `description`
            },
            {
                label: `organization_tags`,
                map: model => model.organization_tags.map(tag => tag.name).join(`,`)
            },
            {
                label: `forward_to_committees`,
                map: model => model.forward_to_committees.map(committee => committee.name).join(`,`)
            },
            {
                label: `managers`,
                map: model =>
                    model
                        .getManagers()
                        .map(manager => manager.username)
                        .join(`, `)
            },
            {
                label: `meeting_name`,
                map: model => model.meetings[0]?.name
            },
            {
                label: `meeting_start_time`,
                map: model => this.meetingRepo.parseUnixToMeetingTime(model.meetings[0]?.start_time * 1000)
            },
            {
                label: `meeting_end_time`,
                map: model => this.meetingRepo.parseUnixToMeetingTime(model.meetings[0]?.end_time * 1000)
            },
            {
                label: `meeting_admins`,
                map: model =>
                    model
                        .getAdmins()
                        .map(manager => manager.username)
                        .join(`, `)
            },
            {
                label: `meeting_template`,
                map: _ => ``
            }
        ];
        const filename = `${this.translate.instant(`Committees`)}.csv`;
        this.csvExport.export(committees, properties, filename);
    }
}
