import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { AccountCsvExportExample } from '../../export/csv-export-example';
import { accountColumns } from '../../pages/account-import/definitions';
import { AccountExportServiceModule } from '../account-export-service.module';

@Injectable({
    providedIn: AccountExportServiceModule
})
export class AccountExportService {
    public constructor(
        private csvExportService: CsvExportForBackendService,
        private translate: TranslateService
    ) {}

    /**
     * Translates values of the given columns in example file
     * to the currently used lang.
     */
    public translateSelectedCSVRows(rows: UserExport[], columns: string[]): UserExport[] {
        rows.map(row => {
            for (const column of columns) {
                row[column] = this.translate.instant(row[column]);
            }
        });
        return rows;
    }

    public downloadCsvImportExample(): void {
        const rows: UserExport[] = AccountCsvExportExample;
        const columnsToTranslate: string[] = [`gender`];
        const translatedRows: UserExport[] = this.translateSelectedCSVRows(rows, columnsToTranslate);

        this.csvExportService.dummyCSVExport<UserExport>(
            accountColumns,
            translatedRows,
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
