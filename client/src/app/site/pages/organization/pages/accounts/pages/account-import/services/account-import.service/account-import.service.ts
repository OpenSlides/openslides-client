import { Injectable } from '@angular/core';
import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';
import { ImportConfig } from 'src/app/infrastructure/utils/import/import-utils';
import { BaseUserImportService } from 'src/app/site/base/base-user-import.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { AccountExportService } from '../../../../services/account-export.service';
import { AccountImportServiceModule } from '../account-import-service.module';

@Injectable({
    providedIn: AccountImportServiceModule
})
export class AccountImportService extends BaseUserImportService {
    public override errorList = {
        Duplicates: `This user already exists`,
        NoName: `Entry has no valid name`,
        DuplicateImport: `Entry cannot be imported twice. This line will be ommitted`,
        ParsingErrors: `Some csv values could not be read correctly.`,
        FailedImport: `Imported user could not be imported.`,
        vote_weight: `The vote weight has too many decimal places (max.: 6).`
    };

    public constructor(
        importServiceCollector: ImportServiceCollectorService,
        private repo: UserControllerService,
        private exporter: AccountExportService
    ) {
        super(importServiceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.downloadCsvImportExample();
    }

    protected getConfig(): ImportConfig<User> {
        return {
            modelHeadersAndVerboseNames: userHeadersAndVerboseNames,
            verboseNameFn: plural => (plural ? `Accounts` : `Account`),
            getDuplicatesFn: (entry: Partial<User>) =>
                this.repo.getViewModelList().filter(user => user.username === entry.username),
            createFn: (entries: any[]) => this.repo.create(...entries)
        };
    }
}
