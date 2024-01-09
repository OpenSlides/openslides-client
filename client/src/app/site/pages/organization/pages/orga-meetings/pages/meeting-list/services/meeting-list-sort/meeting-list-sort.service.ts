import { Injectable, Injector, ProviderToken } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MeetingRepositoryService } from 'src/app/gateways/repositories/meeting-repository.service';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

@Injectable({
    providedIn: `root`
})
export class MeetingListSortService extends BaseSortListService<ViewMeeting> {
    protected storageKey = `CommitteeList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = MeetingRepositoryService;

    private readonly staticSortOptions: OsSortingOption<ViewMeeting>[] = [
        { property: `name`, label: _(`Title`) },
        { property: `start_time`, label: _(`Start date`) },
        { property: `end_time`, label: _(`End date`) },
        { property: `location`, label: _(`Event location`) },
        { property: `committeeName`, label: _(`Committee`), baseKeys: [], foreignBaseKeys: { committee: [`name`] } },
        { property: `userAmount`, label: _(`Number of participants`), baseKeys: [`meeting_user_ids`] },
        { property: `motionsAmount`, label: _(`Number of motions`), baseKeys: [`motion_ids`] }
    ];

    public constructor() {
        super({
            sortProperty: `name`,
            sortAscending: true
        });
    }

    protected getSortOptions(): OsSortingOption<ViewMeeting>[] {
        return this.staticSortOptions;
    }
}
