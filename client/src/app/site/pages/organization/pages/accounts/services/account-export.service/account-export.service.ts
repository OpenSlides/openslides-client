import { Injectable } from '@angular/core';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { CsvExportService } from 'src/app/gateways/export/csv-export.service';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { AccountCsvExportExample } from '../../export/csv-export-example';
import { AccountExportServiceModule } from '../account-export-service.module';

@Injectable({
    providedIn: AccountExportServiceModule
})
export class AccountExportService {
    public constructor(private csvExportService: CsvExportService, private translate: TranslateService) {}

    public downloadCsvImportExample(): void {
        this.csvExportService.dummyCSVExport<UserExport>(
            userHeadersAndVerboseNames,
            AccountCsvExportExample,
            `${this.translate.instant(`account-example`)}.csv`
        );
    }

    public downloadAccountCsvFile(dataSource: ViewUser[]): void {
        this.csvExportService.export(
            dataSource,
            Object.entries(userHeadersAndVerboseNames).map(([key, value]) => ({
                property: key as keyof ViewUser,
                label: value
            })),
            `${this.translate.instant(`Accounts`)}.csv`
        );
    }
}
