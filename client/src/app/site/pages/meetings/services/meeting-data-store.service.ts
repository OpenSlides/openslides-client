import { inject, Service } from '@angular/core';
import { DataStoreService } from '@app/site/services/data-store.service';

import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';

@Service()
export class MeetingDataStoreService {
    private modelMapper = inject(MeetingCollectionMapperService);
    private datastore = inject(DataStoreService);

    /**
     * Deletes all models that belong to a meeting.
     */
    public async clearMeetingModels(): Promise<void> {
        const removedCollections = [];
        for (const collection of this.datastore.getCollections()) {
            if (this.modelMapper.isMeetingSpecificCollection(collection)) {
                removedCollections.push(collection);
            }
        }
        this.datastore.deleteCollections(...removedCollections);
    }
}
