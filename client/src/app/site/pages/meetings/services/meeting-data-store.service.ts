import { Injectable } from '@angular/core';
import { DataStoreService } from 'src/app/site/services/data-store.service';

import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';

@Injectable({
    providedIn: `root`
})
export class MeetingDataStoreService {
    public constructor(
        private modelMapper: MeetingCollectionMapperService,
        private datastore: DataStoreService
    ) {}

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
