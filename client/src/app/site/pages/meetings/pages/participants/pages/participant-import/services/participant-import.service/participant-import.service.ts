import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { BaseBackendImportService } from 'src/app/site/base/base-import.service/base-backend-import.service';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { ParticipantCsvExportService } from '../../../../export/participant-csv-export.service/participant-csv-export.service';
import { ParticipantImportServiceModule } from '../participant-import-service.module';

@Injectable({
    providedIn: ParticipantImportServiceModule
})
export class ParticipantImportService extends BaseBackendImportService {
    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public override requiredHeaderLength = 1;

    /**
     * List of possible errors and their verbose explanation
     */
    public errorList = {
        Group: `Group cannot be resolved`,
        Duplicates: `This user already exists in this meeting`,
        NoName: `Entry has no valid name`,
        DuplicateImport: `Entry cannot be imported twice. This line will be ommitted`,
        ParsingErrors: `Some csv values could not be read correctly.`,
        FailedImport: `Imported user could not be imported.`,
        vote_weight: `The vote weight has too many decimal places (max.: 6).`
    };

    public override readonly verboseSummaryTitles: { [title: string]: string } = {
        total: _(`Total participants`),
        created: _(`Participants created`),
        updated: _(`Participants updated`),
        omitted: _(`Participants skipped`),
        warning: _(`Participants with warnings: affected cells will be skipped`),
        error: _(`Participants with errors`)
    };

    public constructor(
        importServiceCollector: ImportServiceCollectorService,
        private repo: ParticipantControllerService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private exporter: ParticipantCsvExportService
    ) {
        super(importServiceCollector);
    }

    /**
     * Triggers an example csv download
     */
    public downloadCsvExample(): void {
        this.exporter.exportCsvExample();
    }

    protected override calculateJsonUploadPayload(): any {
        const payload = super.calculateJsonUploadPayload();
        payload[`meeting_id`] = this.activeMeetingIdService.meetingId;
        return payload;
    }

    protected async import(
        actionWorkerIds: number[],
        abort = false
    ): Promise<void | (BackendImportRawPreview | void)[]> {
        return await this.repo.import(actionWorkerIds.map(id => ({ id, import: !abort }))).resolve();
    }

    protected async jsonUpload(payload: { [key: string]: any }): Promise<void | BackendImportRawPreview[]> {
        return await this.repo.jsonUpload(payload).resolve();
    }
}
