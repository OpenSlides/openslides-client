import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { AccountCsvExportExample } from '../../export/csv-export-example';
import { accountColumnsWeight, accountHeadersAndVerboseNames } from '../../pages/account-import/definitions';
import { AccountExportServiceModule } from '../account-export-service.module';

@Injectable({
    providedIn: AccountExportServiceModule
})
export class AccountExportService {
    public constructor(private csvExportService: CsvExportForBackendService, private translate: TranslateService) {}

    public downloadCsvImportExample(): void {
        this.csvExportService.dummyCSVExport<UserExport>(
            Object.keys(accountHeadersAndVerboseNames).sort(
                (a, b) => accountColumnsWeight[a] - accountColumnsWeight[b]
            ),
            AccountCsvExportExample,
            `${this.translate.instant(`account-example`)}.csv`
        );
    }

    public downloadAccountCsvFile(dataSource: ViewUser[]): void {
        this.csvExportService.export(
            dataSource,
            Object.keys(accountHeadersAndVerboseNames)
                .map(key => ({
                    property: key as keyof ViewUser
                }))
                .sort((a, b) => accountColumnsWeight[a.property] - accountColumnsWeight[b.property]),
            `${this.translate.instant(`Accounts`)}.csv`
        );
    }
}
