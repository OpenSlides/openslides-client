import { FormBuilder, FormControl } from '@angular/forms';

import { NewEntry } from 'app/core/ui-services/base-import.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { User } from 'app/shared/models/users/user';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';
import { BaseUserImportService } from './base-user-import.service';
import { ImportListViewHeaderDefinition } from '../../../shared/components/import-list-view/import-list-view.component';

export abstract class BaseUserImportListComponent extends BaseImportListComponent<User> {
    public textAreaForm: FormControl;

    public possibleFields = Object.values(this.modelHeadersAndVerboseNames);

    public get generateImportColumns(): ImportListViewHeaderDefinition[] {
        return this.modelHeaders.map(property => {
            const singleColumnDef: ImportListViewHeaderDefinition = {
                label: this.translate.instant(this.modelHeadersAndVerboseNames[property]),
                prop: `newEntry.${property}`,
                type: this.guessType(property as keyof User),
                isTableColumn: true
            };

            return singleColumnDef;
        });
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public importer: BaseUserImportService,
        protected formBuilder: FormBuilder,
        protected modelHeadersAndVerboseNames: { [key: string]: string },
        protected modelHeaders: (keyof User)[]
    ) {
        super(componentServiceCollector, importer);
        this.textAreaForm = formBuilder.control('');
    }

    /**
     * Shorthand for getVerboseError on name fields checking for duplicates and invalid fields
     *
     * @param row
     * @returns an error string similar to getVerboseError
     */
    public nameErrors(row: NewEntry<User>): string {
        for (const name of ['NoName', 'Duplicates', 'DuplicateImport']) {
            if (this.importer.hasError(row, name)) {
                return this.importer.verbose(name);
            }
        }
        return '';
    }

    /**
     * Sends the data in the text field input area to the importer
     */
    public parseTextArea(): void {
        this.importer.parseTextArea(this.textAreaForm.value);
    }

    protected abstract guessType(property: keyof User): 'string' | 'number' | 'boolean';
}
