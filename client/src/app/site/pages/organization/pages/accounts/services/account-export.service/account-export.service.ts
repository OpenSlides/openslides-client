import { Injectable } from '@angular/core';
import { UserExport } from '@app/domain/models/users/user.export';
import { CsvExportForBackendService } from '@app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { TranslateService } from '@ngx-translate/core';

import { AccountCsvExportExample } from '../../export/csv-export-example';
import { accountColumns } from '../../pages/account-import/definitions';

@Injectable({
    providedIn: 'root'
})
export class AccountExportService {
    public constructor(
        private csvExportService: CsvExportForBackendService,
        private translate: TranslateService
    ) {}

    public downloadCsvImportExample(): void {
        this.csvExportService.dummyCSVExport<UserExport>(
            accountColumns,
            AccountCsvExportExample,
            `${this.translate.instant(`account-example`)}.csv`
        );
    }

    public downloadAccountCsvFile(dataSource: ViewUser[]): void {
        this.csvExportService.export(
            dataSource,
            accountColumns.map(key => ({
                property: key as keyof ViewUser
            })),
            `${this.translate.instant(`Accounts`)}.csv`
        );
    }
}
