import { Directive } from '@angular/core';

import { User } from '../../domain/models/users/user';
import { ImportServiceCollectorService } from '../services/import-service-collector.service';
import { BaseImportService } from './base-import.service';

@Directive()
export abstract class BaseUserImportService extends BaseImportService<User> {
    public override requiredHeaderLength = 3;

    public constructor(importServiceCollector: ImportServiceCollectorService) {
        super(importServiceCollector);
    }

    protected override pipeParseValue(value: string, header: keyof User): any {
        if (header === `is_active` || header === `is_physical_person`) {
            return this.toBoolean(value);
        }

        if (header === 'first_name' || header === 'last_name' || header === 'username') {
            return value.trim();
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
