import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

import { PollServiceModule } from '../services/poll-service.module';

@Injectable({
    providedIn: PollServiceModule
})
export class EntitledUsersListFilterService extends BaseFilterListService<any> {
    protected storageKey = `EntitledUsersEntry`;

    public constructor(store: ActiveFiltersService) {
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
