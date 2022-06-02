import { Directive } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { User } from '../../domain/models/users/user';
import { ImportModel } from '../../infrastructure/utils/import/import-model';
import { ImportListHeaderDefinition } from '../../ui/modules/import-list/definitions/import-list-header-definition';
import { ComponentServiceCollectorService } from '../services/component-service-collector.service';
import { BaseImportListComponent } from './base-import-list.component';
import { BaseUserImportService } from './base-user-import.service';

@Directive()
export abstract class BaseUserImportListComponent extends BaseImportListComponent<User> {
    public textAreaForm: FormControl;

    public possibleFields = Object.values(this.modelHeadersAndVerboseNames);

    public get generateImportColumns(): ImportListHeaderDefinition[] {
        return this.modelHeaders.map(property => {
            const singleColumnDef: ImportListHeaderDefinition = {
                label: this.translate.instant(this.modelHeadersAndVerboseNames[property]),
                property: `newEntry.${property}`,
                type: this.guessType(property as keyof User),
                isTableColumn: true
            };

            return singleColumnDef;
        });
    }

    private get modelHeaders(): (keyof User)[] {
        return Object.keys(this.modelHeadersAndVerboseNames) as (keyof User)[];
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public override importer: BaseUserImportService,
        protected formBuilder: FormBuilder,
        protected modelHeadersAndVerboseNames: { [key: string]: string }
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
    public nameErrors(row: ImportModel<User>): string {
        for (const name of [`NoName`, `Duplicates`, `DuplicateImport`]) {
            if (this.importer.hasError(row, name)) {
                return this.importer.verbose(name);
            }
        }
        return ``;
    }

    protected abstract guessType(property: keyof User): 'string' | 'number' | 'boolean';
}
