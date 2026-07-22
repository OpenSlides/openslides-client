import { inject, Service } from '@angular/core';
import { CsvExportForBackendService } from '@app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { BaseBackendImportService } from '@app/site/base/base-import.service/base-backend-import.service';
import { ImportServiceCollectorService } from '@app/site/services/import-service-collector.service';
import { BackendImportRawPreview } from '@app/ui/modules/import-list/definitions/backend-import-preview';
import { _ } from '@ngx-translate/core';

import { COMMITTEE_CSV_EXPORT_EXAMPLE } from '../../../../export';
import { CommitteeControllerService } from '../../../../services/committee-controller.service';
import { committeeHeadersAndVerboseNames } from '../../definitions';

@Service()
export class CommitteeImportService extends BaseBackendImportService {
    public override errorList = {
        Duplicates: _(`This committee already exists`)
    };

    public override requiredHeaderLength = 1;

    public override readonly verboseSummaryTitles: Record<string, string> = {
        total: _(`Total committees`),
        created: _(`Committees created`),
        updated: _(`Committees updated`),
        error: _(`Committees with errors`),
        warning: _(`Committees with warnings: affected cells will be skipped`)
    };

    private exporter = inject(CsvExportForBackendService);
    private repo = inject(CommitteeControllerService);

    public constructor() {
        const importServiceCollector = inject(ImportServiceCollectorService);
        super(importServiceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.dummyCSVExport(
            Object.keys(committeeHeadersAndVerboseNames),
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

    protected async jsonUpload(payload: Record<string, any>): Promise<void | BackendImportRawPreview[]> {
        return await this.repo.jsonUpload(payload).resolve();
    }
}
