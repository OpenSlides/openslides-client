import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { ActiveFiltersStoreService } from 'src/app/ui/modules/list/definitions';

import { OsFilter } from '../base/base-filter.service';

@Injectable({
    providedIn: `root`
})
export class ActiveFiltersService implements ActiveFiltersStoreService {
    public constructor(private store: StorageService) {}

    public async save<V>(storageKey: string, filterDefinitions: OsFilter<V>[]): Promise<void> {
        return await this.store.set(`filter_` + storageKey, filterDefinitions);
    }

    public load<V>(storageKey: string): Promise<OsFilter<V>[]> {
        return this.store.get<OsFilter<V>[]>(`filter_` + storageKey);
    }
}
