import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ActiveMeetingService } from '../../site/pages/meetings/services/active-meeting.service';
import { ActiveMeetingIdService } from '../../site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from '../../site/pages/meetings/services/meeting-settings.service';
import { CollectionMapperService } from '../../site/services/collection-mapper.service';
import { DataStoreService } from '../../site/services/data-store.service';
import { RelationManagerService } from '../../site/services/relation-manager.service';
import { ViewModelStoreService } from '../../site/services/view-model-store.service';
import { ActionService } from '../actions';
import { RepositoryServiceCollectorService } from './repository-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class RepositoryMeetingServiceCollectorService {
    public get DS(): DataStoreService {
        return this.repositoryServiceCollector.DS;
    }

    public get actionService(): ActionService {
        return this.repositoryServiceCollector.actionService;
    }

    public get collectionMapperService(): CollectionMapperService {
        return this.repositoryServiceCollector.collectionMapperService;
    }

    public get viewModelStoreService(): ViewModelStoreService {
        return this.repositoryServiceCollector.viewModelStoreService;
    }

    public get translate(): TranslateService {
        return this.repositoryServiceCollector.translate;
    }

    public get relationManager(): RelationManagerService {
        return this.repositoryServiceCollector.relationManager;
    }

    public get collectionToKeyUpdatesObservableMap(): { [collection: string]: BehaviorSubject<string[]> } {
        return this.repositoryServiceCollector.collectionToKeyUpdatesObservableMap;
    }

    public constructor(
        private repositoryServiceCollector: RepositoryServiceCollectorService,
        public activeMeetingIdService: ActiveMeetingIdService,
        public activeMeetingService: ActiveMeetingService,
        public meetingSettingsService: MeetingSettingsService
    ) {}

    /**
     * Allows repositories to register if there have been updates on a certain key of their model,
     * so other repositories can check them for the sake of their resorting logic
     * @param collection the calling repositories own collection
     * @param newKeys the keys that were updated in the repository
     */
    public registerNewKeyUpdates(collection: string, newKeys: string[]): void {
        this.repositoryServiceCollector.registerNewKeyUpdates(collection, newKeys);
    }

    /**
     * Returns an observable that allows repositories to be notified when there are key updates on other model types
     * @param collection the collection of the other model type.
     * @returns an observable with the changed keys
     */
    public getNewKeyUpdatesObservable(collection: string): Observable<string[]> {
        return this.repositoryServiceCollector.getNewKeyUpdatesObservable(collection);
    }
}
