import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { BaseImportService } from 'app/core/ui-services/base-import.service';
import { User } from 'app/shared/models/users/user';

import { ImportServiceCollector } from '../../../core/ui-services/import-service-collector';

export abstract class BaseUserImportService extends BaseImportService<User> {
    public requiredHeaderLength = 3;

    public constructor(serviceCollector: ImportServiceCollector, protected repo: UserRepositoryService) {
        super(serviceCollector);
    }

    protected pipeParseValue(value: string, header: keyof User): any {
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
