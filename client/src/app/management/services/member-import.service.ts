import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ImportConfig } from 'app/core/ui-services/base-import.service';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { User } from 'app/shared/models/users/user';
import { BaseUserExport } from 'app/site/users/base/base-user-export';
import { BaseUserImportService } from 'app/site/users/base/base-user-import.service';
import { BaseUserHeadersAndVerboseNames } from 'app/site/users/base/base-user.constants';
import { MemberCsvExportExample } from '../export/member-csv-export-example';

@Injectable({
    providedIn: 'root'
})
export class MemberImportService extends BaseUserImportService {
    public errorList = {
        Duplicates: 'This user already exists',
        NoName: 'Entry has no valid name',
        DuplicateImport: 'Entry cannot be imported twice. This line will be ommitted',
        ParsingErrors: 'Some csv values could not be read correctly.',
        FailedImport: 'Imported user could not be imported.',
        vote_weight: 'The vote weight has too many decimal places (max.: 6).'
    };

    public constructor(
        translate: TranslateService,
        papa: Papa,
        matSnackBar: MatSnackBar,
        repo: UserRepositoryService,
        private exporter: CsvExportService
    ) {
        super(translate, papa, matSnackBar, repo);
    }

    public downloadCsvExample(): void {
        this.exporter.dummyCSVExport<BaseUserExport>(
            BaseUserHeadersAndVerboseNames,
            MemberCsvExportExample,
            `${this.translate.instant('members-example')}.csv`
        );
    }

    protected getConfig(): ImportConfig<User> {
        return {
            modelHeadersAndVerboseNames: BaseUserHeadersAndVerboseNames,
            hasDuplicatesFn: (entry: Partial<User>) =>
                this.repo.getViewModelList().some(user => user.username === entry.username),
            bulkCreateFn: (entries: any[]) => this.repo.create(...entries)
        };
    }
}
