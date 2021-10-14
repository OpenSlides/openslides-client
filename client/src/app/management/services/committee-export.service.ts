import { Injectable } from '@angular/core';
import { ViewCommittee } from '../models/view-committee';
import { CsvExportService, CsvColumnsDefinition } from '../../core/ui-services/csv-export.service';
import { TranslateService } from '@ngx-translate/core';
import { MeetingRepositoryService } from '../../core/repositories/management/meeting-repository.service';

@Injectable({
    providedIn: 'root'
})
export class CommitteeExportService {
    public constructor(
        private translate: TranslateService,
        private csvExport: CsvExportService,
        private meetingRepo: MeetingRepositoryService
    ) {}

    public export(committees: ViewCommittee[]): void {
        const properties: CsvColumnsDefinition<ViewCommittee> = [
            {
                label: 'Title',
                property: 'name'
            },
            {
                label: 'Description',
                property: 'description'
            },
            {
                label: 'Tags',
                map: model => model.organization_tags.map(tag => tag.name).join(', ')
            },
            {
                label: 'Can forward motions to committee',
                map: model => model.forward_to_committees.map(committee => committee.name).join(', ')
            },
            {
                label: 'Committee managers',
                map: model =>
                    model
                        .getManagers()
                        .map(manager => manager.full_name)
                        .join(', ')
            },
            {
                label: 'Meeting',
                map: model => (console.log('meeting:', model.meetings[0]), model.meetings[0]?.name)
            },
            {
                label: "Meeting's start date",
                map: model => this.meetingRepo.parseUnixToMeetingTime(model.meetings[0]?.start_time * 1000)
            },
            {
                label: "Meeting's end date",
                map: model => this.meetingRepo.parseUnixToMeetingTime(model.meetings[0]?.end_time * 1000)
            }
        ];
        const filename = `${this.translate.instant('Committees')}.csv`;
        this.csvExport.export(committees, properties, filename);
    }
}
