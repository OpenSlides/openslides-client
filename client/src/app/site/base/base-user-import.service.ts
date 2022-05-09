import { Directive } from '@angular/core';

import { User } from '../../domain/models/users/user';
import { BaseImportService } from './base-import.service';

@Directive()
export abstract class BaseUserImportService extends BaseImportService<User> {
    public override requiredHeaderLength = 3;

    protected override pipeParseValue(value: string, header: keyof User): any {
        if (header === `is_active` || header === `is_physical_person`) {
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
        if (!data || data === `0` || data === `false`) {
            return false;
        } else if (data === `1` || data === `true`) {
            return true;
        } else {
            throw new TypeError(`Value cannot be translated into boolean: ` + data);
        }
    }
}
