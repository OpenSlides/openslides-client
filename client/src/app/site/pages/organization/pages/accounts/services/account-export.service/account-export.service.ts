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
    public columns = Object.keys(accountHeadersAndVerboseNames).sort(
        (a, b) => accountColumnsWeight[a] - accountColumnsWeight[b]
    );

    public constructor(private csvExportService: CsvExportForBackendService, private translate: TranslateService) {}

    public downloadCsvImportExample(): void {
        this.csvExportService.dummyCSVExport<UserExport>(
            this.columns,
            AccountCsvExportExample,
            `${this.translate.instant(`account-example`)}.csv`
        );
    }

    public downloadAccountCsvFile(dataSource: ViewUser[]): void {
        this.csvExportService.export(
            dataSource,
            this.columns.map(key => ({
                property: key as keyof ViewUser
            })),
            `${this.translate.instant(`Accounts`)}.csv`
        );
    }
}
