import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { BaseBackendImportService } from 'src/app/site/base/base-import.service/base-backend-import.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { COMMITTEE_CSV_EXPORT_EXAMPLE } from '../../../../export';
import { CommitteeControllerService } from '../../../../services/committee-controller.service';
import { committeeHeadersAndVerboseNames } from '../../definitions';
import { CommitteeImportServiceModule } from '../committee-import-service.module';

@Injectable({
    providedIn: CommitteeImportServiceModule
})
export class CommitteeImportService extends BaseBackendImportService {
    public override errorList = {
        Duplicates: _(`This committee already exists`)
    };

    public override requiredHeaderLength = 1;

    public override readonly verboseSummaryTitles: { [title: string]: string } = {
        total: _(`Total committees`),
        created: _(`Committees created`),
        updated: _(`Committees updated`),
        error: _(`Committees with errors`),
        warning: _(`Committees with warnings: affected cells will be skipped`)
    };

    public constructor(
        importServiceCollector: ImportServiceCollectorService,
        private exporter: CsvExportForBackendService,
        private repo: CommitteeControllerService
    ) {
        super(importServiceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.dummyCSVExport(
            committeeHeadersAndVerboseNames,
            COMMITTEE_CSV_EXPORT_EXAMPLE,
            `${this.translate.instant(`committee-example`)}.csv`
        );
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
