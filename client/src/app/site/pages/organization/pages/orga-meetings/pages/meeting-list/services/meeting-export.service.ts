import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnDefinitionProperty, CsvColumnsDefinition } from 'src/app/gateways/export/csv-export.service';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { MeetingListServiceModule } from './meeting-list-service.module';

@Injectable({
    providedIn: MeetingListServiceModule
})
export class MeetingCsvExportService {
    private meetingHeadersAndVerboseNames = {
        name: _(`Meeting name`),
        committeeName: _(`Committee name`),
        location: _(`Location`),
        start_time: {
            label: _(`Start`),
            map: (model: ViewMeeting): string => this.meetingRepo.parseUnixToMeetingTime(model?.start_time * 1000)
        },
        end_time: {
            label: _(`End`),
            map: (model: ViewMeeting): string => this.meetingRepo.parseUnixToMeetingTime(model?.end_time * 1000)
        },
        description: _(`Description`),
        userAmount: _(`User amount`),
        motionsAmount: _(`Motion amount`)
    };

    public constructor(
        private csvExport: CsvExportForBackendService,
        private translate: TranslateService,
        private meetingRepo: MeetingControllerService
    ) {}

    public export(meetings: ViewMeeting[]): void {
        this.csvExport.export(
            meetings,
            Object.keys(this.meetingHeadersAndVerboseNames).map(key => {
                if (typeof this.meetingHeadersAndVerboseNames[key] !== `string`) {
                    return this.meetingHeadersAndVerboseNames[key];
                }

                return {
                    property: key,
                    label: this.translate.instant(this.meetingHeadersAndVerboseNames[key])
                } as CsvColumnDefinitionProperty<ViewMeeting>;
            }) as CsvColumnsDefinition<ViewMeeting>,
            this.translate.instant(`Meetings`) + `.csv`
        );
    }
}
