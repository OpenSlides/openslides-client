import { Injectable } from '@angular/core';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ImportConfig } from 'app/core/ui-services/base-import.service';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { User } from 'app/shared/models/users/user';
import { memberHeadersAndVerboseNames } from 'app/site/users/base/base-user.constants';
import { BaseUserExport } from 'app/site/users/base/base-user-export';
import { BaseUserImportService } from 'app/site/users/base/base-user-import.service';

import { ImportServiceCollector } from '../../core/ui-services/import-service-collector';
import { MemberCsvExportExample } from '../export/member-csv-export-example';

@Injectable({
    providedIn: `root`
})
export class MemberImportService extends BaseUserImportService {
    public errorList = {
        Duplicates: `This user already exists`,
        NoName: `Entry has no valid name`,
        DuplicateImport: `Entry cannot be imported twice. This line will be ommitted`,
        ParsingErrors: `Some csv values could not be read correctly.`,
        FailedImport: `Imported user could not be imported.`,
        vote_weight: `The vote weight has too many decimal places (max.: 6).`
    };

    public constructor(
        serviceCollector: ImportServiceCollector,
        repo: UserRepositoryService,
        private exporter: CsvExportService
    ) {
        super(serviceCollector, repo);
    }

    public downloadCsvExample(): void {
        this.exporter.dummyCSVExport<BaseUserExport>(
            memberHeadersAndVerboseNames,
            MemberCsvExportExample,
            `${this.translate.instant(`account-example`)}.csv`
        );
    }

    protected getConfig(): ImportConfig<User> {
        return {
            modelHeadersAndVerboseNames: memberHeadersAndVerboseNames,
            verboseNameFn: plural => (plural ? `Accounts` : `Account`),
            getDuplicatesFn: (entry: Partial<User>) =>
                this.repo.getViewModelList().filter(user => user.username === entry.username),
            createFn: (entries: any[]) => this.repo.create(...entries)
        };
    }
}
