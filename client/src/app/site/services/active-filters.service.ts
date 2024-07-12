import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ActiveFiltersStoreService } from 'src/app/ui/modules/list/definitions';

import { OsFilter } from '../base/base-filter.service';

@Injectable({
    providedIn: `root`
})
export class ActiveFiltersService implements ActiveFiltersStoreService {
    public constructor(private store: StorageService, private activeMeetingIdService: ActiveMeetingIdService) {}

    public async save<V>(storageKey: string, filterDefinitions: OsFilter<V>[]): Promise<void> {
        return await this.store.set(this.calcStorageKey(storageKey), filterDefinitions);
    }

    public load<V>(storageKey: string): Promise<OsFilter<V>[]> {
        return this.store.get<OsFilter<V>[]>(this.calcStorageKey(storageKey));
    }

    private calcStorageKey(storageKey: string): string {
        const possibleMeetingId = this.activeMeetingIdService.meetingId;
        if (possibleMeetingId) {
            return `filter_${storageKey}_${possibleMeetingId}`;
        }
        return `filter_${storageKey}`;
    }
}
