import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { AccountCsvExportExample } from '../../export/csv-export-example';
import { accountHeadersAndVerboseNames } from '../../pages/account-import/definitions';
import { AccountExportServiceModule } from '../account-export-service.module';

@Injectable({
    providedIn: AccountExportServiceModule
})
export class AccountExportService {
    public constructor(private csvExportService: CsvExportForBackendService, private translate: TranslateService) {}

    public downloadCsvImportExample(): void {
        this.csvExportService.dummyCSVExport<UserExport>(
            accountHeadersAndVerboseNames,
            AccountCsvExportExample,
            `${this.translate.instant(`account-example`)}.csv`
        );
    }

    public downloadAccountCsvFile(dataSource: ViewUser[]): void {
        this.csvExportService.export(
            dataSource,
            Object.entries(accountHeadersAndVerboseNames).map(([key, value]) => ({
                property: key as keyof ViewUser,
                label: value
            })),
            `${this.translate.instant(`Accounts`)}.csv`
        );
    }
}
