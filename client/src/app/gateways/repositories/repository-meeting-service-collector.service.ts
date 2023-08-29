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

    public registerNewKeyUpdates(collection: string, newKeys: string[]): void {
        this.repositoryServiceCollector.registerNewKeyUpdates(collection, newKeys);
    }

    public getNewKeyUpdatesObservable(collection: string): Observable<string[]> {
        return this.repositoryServiceCollector.getNewKeyUpdatesObservable(collection);
    }
}
