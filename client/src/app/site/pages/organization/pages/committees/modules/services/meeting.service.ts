import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FileExportService } from 'src/app/gateways/export/file-export.service/file-export.service';
import { ExportMeetingPresenterService } from 'src/app/gateways/presenter/export-meeting-presenter.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { AccountFilterService } from '../../../accounts/services/common/account-filter.service';
import { CommitteeComponentsServiceModule } from './committee-components-service.module';

@Injectable({
    providedIn: CommitteeComponentsServiceModule
})
export class MeetingService {
    public constructor(
        private router: Router,
        private accountFilterService: AccountFilterService,
        private exporter: FileExportService,
        private exportMeetingPresenter: ExportMeetingPresenterService
    ) {}

    public async navigateToMeetingUsers(meeting: ViewMeeting): Promise<void> {
        await this.router.navigate([`accounts`]);
        this.accountFilterService.clearAllFilters();
        this.accountFilterService.toggleFilterOption(`id`, {
            condition: meeting.calculated_user_ids,
            label: meeting.name
        });
    }

    public async exportMeeting(meeting: ViewMeeting): Promise<void> {
        const jsonBlob = await this.exportMeetingPresenter.call({ meeting_id: meeting.id });
        this.exporter.saveFile(JSON.stringify(jsonBlob), `${meeting.name}.json`);
    }
}
