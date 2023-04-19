import { Injectable } from '@angular/core';
import { OsFilter } from 'src/app/site/base/base-filter.service';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';
import { ActiveFiltersStoreService } from 'src/app/ui/modules/list/definitions';

import { HistoryService } from '../pages/history/services/history.service';

@Injectable({
    providedIn: `root`
})
export class MeetingActiveFiltersService implements ActiveFiltersStoreService {
    public constructor(private historyService: HistoryService, private activeFiltersService: ActiveFiltersService) {}

    public async save<V>(storageKey: string, filterDefinitions: OsFilter<V>[]): Promise<void> {
        if (!this.historyService.isInHistoryMode()) {
            return await this.activeFiltersService.save<V>(storageKey, filterDefinitions);
        }
    }

    public load<V>(storageKey: string): Promise<OsFilter<V>[] | null> {
        if (!this.historyService.isInHistoryMode()) {
            return this.activeFiltersService.load<V>(storageKey);
        }
        return null;
    }
}
