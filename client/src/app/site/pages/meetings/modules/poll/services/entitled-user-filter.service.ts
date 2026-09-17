import { inject, Service } from '@angular/core';
import { BaseFilterListService, OsFilter } from '@app/site/base/base-filter.service';
import { ActiveFiltersService } from '@app/site/services/active-filters.service';
import { _ } from '@ngx-translate/core';

@Service()
export class EntitledUsersListFilterService extends BaseFilterListService<any> {
    protected storageKey = `EntitledUsersEntry`;

    public constructor() {
        const store = inject(ActiveFiltersService);
        super(store);
    }

    protected getFilterDefinitions(): OsFilter<any>[] {
        return [
            {
                property: `present`,
                label: _(`Is present`),
                options: [
                    { label: _(`Is present`), condition: true },
                    { label: _(`Is not present`), condition: [false, null] }
                ]
            },
            {
                property: `voted`,
                label: _(`Voted`),
                options: [
                    { label: _(`Has voted`), condition: true },
                    { label: _(`Has not voted`), condition: [false, null] }
                ]
            }
        ];
    }
}
