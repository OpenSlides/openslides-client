import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { BaseImportService, ImportConfig, NewEntry } from 'app/core/ui-services/base-import.service';
import { User } from 'app/shared/models/users/user';
import { ImportHelper } from 'app/site/common/import/import-helper';
import { GroupImportHelper } from '../import/group-import-helper';
import { userHeadersAndVerboseNames } from '../users.constants';

const GROUP_PROPERTY = 'group_ids';

@Injectable({
    providedIn: 'root'
})
export class UserImportService extends BaseImportService<User> {
    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 3;

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
        private repo: UserRepositoryService,
        private groupRepo: GroupRepositoryService,
        translate: TranslateService,
        papa: Papa,
        matSnackbar: MatSnackBar
    ) {
        super(translate, papa, matSnackbar);
    }

    /**
     * parses the data given by the textArea. Expects user names separated by lines.
     * Comma separated values will be read as Surname(s), given name(s) (lastCommaFirst)
     *
     * @param data a string as produced by textArea input
     */
    public parseTextArea(data: string): void {
        const newEntries: NewEntry<User>[] = [];
        this.clearPreview();
        const lines = data.split('\n');
        for (const line of lines) {
            if (!line.length) {
                continue;
            }
            const nameSchema = line.includes(',') ? 'lastCommaFirst' : 'firstSpaceLast';
            const user = this.repo.parseStringIntoUser(line, nameSchema);
            newEntries.push(this.parseLineToImportEntry(user));
        }
        this.setParsedEntries(newEntries);
    }

    protected getConfig(): ImportConfig {
        return {
            modelHeadersAndVerboseNames: userHeadersAndVerboseNames,
            hasDuplicatesFn: (entry: Partial<User>) =>
                this.repo.getViewModelList().some(user => user.username === entry.username),
            bulkCreateFn: (entries: any[]) => this.repo.bulkCreate(entries)
        };
    }

    protected getImportHelpers(): { [key: string]: ImportHelper<User> } {
        return {
            [GROUP_PROPERTY]: new GroupImportHelper(this.groupRepo)
        };
    }

    protected pipeParseValue(value: string, header: keyof User): any {
        if (header === 'is_active' || header === 'is_physical_person') {
            return this.toBoolean(value);
        }
    }

    /**
     * translates a string into a boolean
     *
     * @param data
     * @returns a boolean from the string
     */
    private toBoolean(data: string): Boolean {
        if (!data || data === '0' || data === 'false') {
            return false;
        } else if (data === '1' || data === 'true') {
            return true;
        } else {
            throw new TypeError('Value cannot be translated into boolean: ' + data);
        }
    }

    /**
     * Checks a newly created ViewCsvCreateuser for validity and duplicates,
     *
     * @param user
     * @returns a NewEntry with duplicate/error information
     */
    private parseLineToImportEntry(user: any): NewEntry<User> {
        const newEntry: NewEntry<User> = {
            newEntry: user,
            hasDuplicates: false,
            status: 'new',
            errors: []
        };
        if (user.isValid) {
            newEntry.hasDuplicates = this.repo
                .getViewModelList()
                .some(existingUser => existingUser.full_name === this.repo.getFullName(user));
            if (newEntry.hasDuplicates) {
                this.setError(newEntry, 'Duplicates');
            }
        } else {
            this.setError(newEntry, 'NoName');
        }
        return newEntry;
    }
}
