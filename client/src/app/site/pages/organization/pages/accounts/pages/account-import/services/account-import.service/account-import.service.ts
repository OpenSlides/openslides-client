import { inject, Service } from '@angular/core';
import { BaseBackendImportService } from '@app/site/base/base-import.service/base-backend-import.service';
import { ImportServiceCollectorService } from '@app/site/services/import-service-collector.service';
import { BackendImportRawPreview } from '@app/ui/modules/import-list/definitions/backend-import-preview';
import { _ } from '@ngx-translate/core';

import { AccountExportService } from '../../../../services/account-export.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';

@Service()
export class AccountImportService extends BaseBackendImportService {
    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public override requiredHeaderLength = 1;

    public errorList = {
        Duplicates: `This user already exists`,
        NoName: `Entry has no valid name`,
        DuplicateImport: `Entry cannot be imported twice. This line will be ommitted`,
        ParsingErrors: `Some csv values could not be read correctly.`,
        FailedImport: `Imported user could not be imported.`,
        vote_weight: `The vote weight has too many decimal places (max.: 6).`
    };

    public override readonly verboseSummaryTitles: Record<string, string> = {
        total: _(`Total accounts`),
        created: _(`Accounts created`),
        updated: _(`Accounts updated`),
        error: _(`Accounts with errors`),
        warning: _(`Accounts with warnings: affected cells will be skipped`)
    };

    private repo = inject(AccountControllerService);
    private exporter = inject(AccountExportService);

    public constructor() {
        const importServiceCollector = inject(ImportServiceCollectorService);
        super(importServiceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.downloadCsvImportExample();
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
