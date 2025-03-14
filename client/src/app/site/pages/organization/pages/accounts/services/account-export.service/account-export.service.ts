import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserExport } from 'src/app/domain/models/users/user.export';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

import { AccountCsvExportExample } from '../../export/csv-export-example';
import { accountColumns } from '../../pages/account-import/definitions';
import { AccountExportServiceModule } from '../account-export-service.module';

@Injectable({
    providedIn: AccountExportServiceModule
})
export class AccountExportService {
    public constructor(
        private csvExportService: CsvExportForBackendService,
        private translate: TranslateService,
        private organization: OrganizationService
    ) {}

    private provideExampleRow(): UserExport[] {
        const organization: ViewOrganization = this.organization.organization;
        const row: UserExport[] = AccountCsvExportExample;

        row[0][`gender`] = organization.genders[0].name;

        return row;
    }

    public downloadCsvImportExample(): void {
        const row: UserExport[] = this.provideExampleRow();
        this.csvExportService.dummyCSVExport<UserExport>(
            accountColumns,
            row,
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
