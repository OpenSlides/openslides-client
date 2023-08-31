import { Injectable, Injector, ProviderToken } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MeetingRepositoryService } from 'src/app/gateways/repositories/meeting-repository.service';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { MeetingListServiceModule } from '../meeting-list-service.module';

@Injectable({
    providedIn: MeetingListServiceModule
})
export class MeetingListSortService extends BaseSortListService<ViewMeeting> {
    protected storageKey = `CommitteeList`;

    private readonly staticSortOptions: OsSortingOption<ViewMeeting>[] = [
        { property: `name`, label: _(`Title`) },
        { property: `start_time`, label: _(`Start date`) },
        { property: `end_time`, label: _(`End date`) },
        { property: `location`, label: _(`Event location`) },
        { property: `committeeName`, label: _(`Committee`), baseKeys: [], foreignBaseKeys: { committee: [`name`] } },
        { property: `userAmount`, label: _(`Number of participants`), baseKeys: [`meeting_user_ids`] },
        { property: `motionsAmount`, label: _(`Number of motions`), baseKeys: [`motion_ids`] }
    ];

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = MeetingRepositoryService;

    public constructor(translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, {
            sortProperty: `name`,
            sortAscending: true
        });
    }

    protected getSortOptions(): OsSortingOption<ViewMeeting>[] {
        return this.staticSortOptions;
    }
}
