import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, skip } from 'rxjs';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { DataStoreService } from 'src/app/site/services/data-store.service';
import { RelationManagerService } from 'src/app/site/services/relation-manager.service';
import { ViewModelStoreService } from 'src/app/site/services/view-model-store.service';

import { ActionService } from '../actions';
import { RepositoryMeetingServiceCollectorService } from './repository-meeting-service-collector.service';
import { RepositoryServiceCollectorService } from './repository-service-collector.service';

abstract class MockService {
    public abstract readonly name: keyof RepositoryMeetingServiceCollectorService;
}
class MockDataStore extends MockService {
    public readonly name = `DS`;
}
class MockAction extends MockService {
    public readonly name = `actionService`;
}
class MockCollectionMapper extends MockService {
    public readonly name = `collectionMapperService`;
}
class MockViewModelStore extends MockService {
    public readonly name = `viewModelStoreService`;
}
class MockTranslate extends MockService {
    public readonly name = `translate`;
}
class MockRelationManager extends MockService {
    public readonly name = `relationManager`;
}
class MockActiveMeetingId extends MockService {
    public readonly name = `activeMeetingIdService`;
}
class MockActiveMeeting extends MockService {
    public readonly name = `activeMeetingService`;
}
class MockMeetingSettings extends MockService {
    public readonly name = `meetingSettingsService`;
}

describe(`RepositoryMeetingServiceCollectorService and MeetingServiceCollectorService`, () => {
    let service: RepositoryMeetingServiceCollectorService;

    const serviceGetterTestCases: (keyof RepositoryMeetingServiceCollectorService)[] = [
        `DS`,
        `actionService`,
        `collectionMapperService`,
        `viewModelStoreService`,
        `translate`,
        `relationManager`,
        `activeMeetingIdService`,
        `activeMeetingService`,
        `meetingSettingsService`
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RepositoryMeetingServiceCollectorService,
                RepositoryServiceCollectorService,
                { provide: ActiveMeetingIdService, useClass: MockActiveMeetingId },
                { provide: ActiveMeetingService, useClass: MockActiveMeeting },
                { provide: MeetingSettingsService, useClass: MockMeetingSettings },
                { provide: DataStoreService, useClass: MockDataStore },
                { provide: ActionService, useClass: MockAction },
                { provide: CollectionMapperService, useClass: MockCollectionMapper },
                { provide: ViewModelStoreService, useClass: MockViewModelStore },
                { provide: TranslateService, useClass: MockTranslate },
                { provide: RelationManagerService, useClass: MockRelationManager }
            ]
        });
        service = TestBed.inject(RepositoryMeetingServiceCollectorService);
    });

    for (const testCase of serviceGetterTestCases) {
        it(`test service getter '${testCase}'`, () => {
            expect(service[testCase][`name`]).toBe(testCase);
        });
    }

    it(`test collectionToKeyUpdatesObservableMap`, async () => {
        service.registerNewKeyUpdates(`A collection`, [`key1`, `key2`, `abc`]);
        service.registerNewKeyUpdates(`B collection`, [`1`, `2`, `something`]);
        expect(
            Object.keys(service.collectionToKeyUpdatesObservableMap).flatMap(key => [
                key,
                service.collectionToKeyUpdatesObservableMap[key].value
            ])
        ).toEqual([`A collection`, [`key1`, `key2`, `abc`], `B collection`, [`1`, `2`, `something`]]);
        const promise = firstValueFrom(service.getNewKeyUpdatesObservable(`A collection`).pipe(skip(1)));
        service.registerNewKeyUpdates(`A collection`, [`a`, `b`, `c`]);
        await expectAsync(promise).toBeResolvedTo([`a`, `b`, `c`]);
    });

    it(`test collectionToKeyUpdatesObservableMap for yet unknown collection`, async () => {
        const promise = firstValueFrom(service.getNewKeyUpdatesObservable(`C collection`).pipe(skip(1)));
        expect(
            Object.keys(service.collectionToKeyUpdatesObservableMap).flatMap(key => [
                key,
                service.collectionToKeyUpdatesObservableMap[key].value
            ])
        ).toEqual([`C collection`, []]);
        service.registerNewKeyUpdates(`C collection`, [`a`, `b`, `c`]);
        await expectAsync(promise).toBeResolvedTo([`a`, `b`, `c`]);
    });
});
