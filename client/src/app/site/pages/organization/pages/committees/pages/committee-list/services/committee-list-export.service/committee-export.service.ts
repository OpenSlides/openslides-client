import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnsDefinition, CsvExportService } from 'src/app/gateways/export/csv-export.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';

import { ViewCommittee } from '../../../../view-models/view-committee';
import { CommitteeListServiceModule } from '../committee-list-service.module';

@Injectable({
    providedIn: CommitteeListServiceModule
})
export class CommitteeExportService {
    public constructor(
        private translate: TranslateService,
        private csvExport: CsvExportService,
        private meetingRepo: MeetingControllerService
    ) {}

    public export(committees: ViewCommittee[]): void {
        const properties: CsvColumnsDefinition<ViewCommittee> = [
            {
                label: `Title`,
                property: `name`
            },
            {
                label: `Description`,
                property: `description`
            },
            {
                label: `Tags`,
                map: model => model.organization_tags.map(tag => tag.name).join(`, `)
            },
            {
                label: `Can forward motions to committee`,
                map: model => model.forward_to_committees.map(committee => committee.name).join(`, `)
            },
            {
                label: `Committee admin`,
                map: model =>
                    model
                        .getManagers()
                        .map(manager => manager.full_name)
                        .join(`, `)
            },
            {
                label: `Meeting`,
                map: model => (console.log(`meeting:`, model.meetings[0]), model.meetings[0]?.name)
            },
            {
                label: `Start date`,
                map: model => this.meetingRepo.parseUnixToMeetingTime(model.meetings[0]?.start_time * 1000)
            },
            {
                label: `End date`,
                map: model => this.meetingRepo.parseUnixToMeetingTime(model.meetings[0]?.end_time * 1000)
            }
        ];
        const filename = `${this.translate.instant(`Committees`)}.csv`;
        this.csvExport.export(committees, properties, filename);
    }
}
