import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ImportConfig } from 'app/core/ui-services/base-import.service';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { User } from 'app/shared/models/users/user';
import { ImportHelper } from 'app/site/common/import/import-helper';
import { BaseUserExport } from '../base/base-user-export';
import { BaseUserImportService } from '../base/base-user-import.service';
import { GroupImportHelper } from '../import/group-import-helper';
import { userExportExample } from '../export/user-export-example';
import { userHeadersAndVerboseNames } from '../users.constants';

const GROUP_PROPERTY = 'group_ids';

export interface UserExport extends BaseUserExport {
    comment?: string;
    is_present_in_meeting_ids?: string | boolean;
    group_ids?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserImportService extends BaseUserImportService {
    /**
     * List of possible errors and their verbose explanation
     */
    public errorList = {
        Group: 'Group cannot be resolved',
        Duplicates: 'This user already exists',
        NoName: 'Entry has no valid name',
        DuplicateImport: 'Entry cannot be imported twice. This line will be ommitted',
        ParsingErrors: 'Some csv values could not be read correctly.',
        FailedImport: 'Imported user could not be imported.',
        vote_weight: 'The vote weight has too many decimal places (max.: 6).'
    };

    /**
     * Constructor. Calls parent and sets the expected header
     *
     * @param repo The User repository
     * @param groupRepo the Group repository
     * @param translate TranslationService
     * @param papa csvParser
     * @param matSnackbar MatSnackBar for displaying error messages
     */
    public constructor(
        translate: TranslateService,
        papa: Papa,
        matSnackbar: MatSnackBar,
        repo: UserRepositoryService,
        private groupRepo: GroupRepositoryService,
        private activeMeetingId: ActiveMeetingIdService,
        private exporter: CsvExportService
    ) {
        super(translate, papa, matSnackbar, repo);
    }

    /**
     * Triggers an example csv download
     */
    public downloadCsvExample(): void {
        const rows: UserExport[] = userExportExample;
        this.exporter.dummyCSVExport<UserExport>(
            userHeadersAndVerboseNames,
            rows,
            `${this.translate.instant('participants-example')}.csv`
        );
    }

    protected getConfig(): ImportConfig {
        return {
            modelHeadersAndVerboseNames: userHeadersAndVerboseNames,
            hasDuplicatesFn: (entry: Partial<User>) =>
                this.repo.getViewModelList().some(user => user.username === entry.username),
            bulkCreateFn: (entries: any[]) => this.createUsers(entries)
        };
    }

    protected getImportHelpers(): { [key: string]: ImportHelper<User> } {
        return {
            [GROUP_PROPERTY]: new GroupImportHelper(this.groupRepo)
        };
    }

    private createUsers(users: any[]): Promise<Identifiable[]> {
        for (const user of users) {
            user.is_present_in_meeting_ids =
                user.is_present_in_meeting_ids === '1' ? [this.activeMeetingId.meetingId] : [];
        }
        return this.repo.create(...users);
    }
}
