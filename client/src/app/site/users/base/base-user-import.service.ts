import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { BaseImportService, NewEntry } from 'app/core/ui-services/base-import.service';
import { User } from 'app/shared/models/users/user';

export abstract class BaseUserImportService extends BaseImportService<User> {
    public requiredHeaderLength = 3;

    public constructor(
        translate: TranslateService,
        papa: Papa,
        matSnackBar: MatSnackBar,
        protected repo: UserRepositoryService
    ) {
        super(translate, papa, matSnackBar);
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
            newEntries.push(this.parseLineToImportEntry(user as any));
        }
        this.setParsedEntries(newEntries);
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
    private parseLineToImportEntry(user: User): NewEntry<User> {
        const newEntry: NewEntry<User> = {
            newEntry: user,
            hasDuplicates: false,
            status: 'new',
            errors: []
        };
        if (user.first_name || user.last_name || user.username) {
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
