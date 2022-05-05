import { Injectable } from '@angular/core';
import { DataStoreUpdateManagerService } from 'src/app/site/services/data-store-update-manager.service';
import { DataStoreService } from 'src/app/site/services/data-store.service';
import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';

@Injectable({
    providedIn: 'root'
})
export class MeetingDataStoreService extends DataStoreService {
    public constructor(
        protected override modelMapper: MeetingCollectionMapperService,
        dataStoreUpdateManager: DataStoreUpdateManagerService
    ) {
        super(modelMapper, dataStoreUpdateManager);
    }

    /**
     * Deletes all models that belong to a meeting.
     */
    public async clearMeetingModels(): Promise<void> {
        const removedCollections = [];
        for (const collection of Object.keys(this.modelStore)) {
            if (this.modelMapper.isMeetingSpecificCollection(collection)) {
                delete this.modelStore[collection];
                removedCollections.push(collection);
                this.triggerModifiedObservable();
            }
        }
        this.clearEvent.emit(removedCollections);
    }
}
