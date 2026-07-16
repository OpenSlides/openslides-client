import { inject, Service } from '@angular/core';
import { CsvColumnDefinitionProperty, CsvColumnsDefinition } from '@app/gateways/export/csv-export.service';
import { CsvExportForBackendService } from '@app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { MeetingControllerService } from '@app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from '@app/site/pages/meetings/view-models/view-meeting';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Service()
export class MeetingCsvExportService {
    private meetingHeadersAndVerboseNames = {
        name: _(`Meeting`),
        committeeName: _(`Committee`),
        location: _(`Event location`),
        start_time: {
            label: _(`Start date`),
            map: (model: ViewMeeting): string => this.meetingRepo.parseUnixToMeetingTime(model?.start_time * 1000)
        },
        end_time: {
            label: _(`End date`),
            map: (model: ViewMeeting): string => this.meetingRepo.parseUnixToMeetingTime(model?.end_time * 1000)
        },
        description: _(`Description`),
        userAmount: _(`Participants`),
        motionsAmount: _(`Motions`)
    };

    private csvExport = inject(CsvExportForBackendService);
    private translate = inject(TranslateService);
    private meetingRepo = inject(MeetingControllerService);

    public export(meetings: ViewMeeting[]): void {
        this.csvExport.export(
            meetings,
            Object.keys(this.meetingHeadersAndVerboseNames).map(key => {
                if (typeof this.meetingHeadersAndVerboseNames[key] !== `string`) {
                    const res = { ...this.meetingHeadersAndVerboseNames[key] };
                    res.label = this.translate.instant(res.label);
                    return res;
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
