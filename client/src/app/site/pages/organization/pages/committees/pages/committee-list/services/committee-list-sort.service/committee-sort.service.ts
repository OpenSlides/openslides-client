import { Injectable, Injector, ProviderToken } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { CommitteeRepositoryService } from 'src/app/gateways/repositories/committee-repository.service';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';

import { ViewCommittee } from '../../../../view-models';

@Injectable({
    providedIn: `root`
})
export class CommitteeSortService extends BaseSortListService<ViewCommittee> {
    protected storageKey = `CommitteeList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = CommitteeRepositoryService;

    private readonly staticSortOptions: OsSortingOption<ViewCommittee>[] = [
        { property: `name`, label: _(`Title`) },
        { property: `meetingAmount`, label: _(`Amount of meetings`), baseKeys: [`meeting_ids`] },
        { property: `memberAmount`, label: _(`Amount of accounts`), baseKeys: [`user_ids`] }
    ];

    public constructor(translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, {
            sortProperty: `name`,
            sortAscending: true
        });
    }

    protected getSortOptions(): OsSortingOption<ViewCommittee>[] {
        return this.staticSortOptions;
    }
}
