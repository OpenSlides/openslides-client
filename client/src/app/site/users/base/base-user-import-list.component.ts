import { FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NewEntry } from 'app/core/ui-services/base-import.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { User } from 'app/shared/models/users/user';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';

import { ImportListViewHeaderDefinition } from '../../../shared/components/import-list-view/import-list-view.component';
import { BaseUserImportService } from './base-user-import.service';

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
        protected translate: TranslateService,
        public importer: BaseUserImportService,
        protected formBuilder: FormBuilder,
        protected modelHeadersAndVerboseNames: { [key: string]: string },
        protected modelHeaders: (keyof User)[]
    ) {
        super(componentServiceCollector, translate, importer);
        this.textAreaForm = formBuilder.control(``);
    }

    /**
     * Shorthand for getVerboseError on name fields checking for duplicates and invalid fields
     *
     * @param row
     * @returns an error string similar to getVerboseError
     */
    public nameErrors(row: NewEntry<User>): string {
        for (const name of [`NoName`, `Duplicates`, `DuplicateImport`]) {
            if (this.importer.hasError(row, name)) {
                return this.importer.verbose(name);
            }
        }
        return ``;
    }

    protected abstract guessType(property: keyof User): 'string' | 'number' | 'boolean';
}
