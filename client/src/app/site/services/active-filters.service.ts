import { inject, Service } from '@angular/core';
import { StorageService } from '@app/gateways/storage.service';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { ActiveFiltersStoreService } from '@app/ui/modules/list/definitions';

import { OsFilter } from '../base/base-filter.service';

@Service()
export class ActiveFiltersService implements ActiveFiltersStoreService {
    private store = inject(StorageService);
    private activeMeetingIdService = inject(ActiveMeetingIdService);

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
