import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';

import { ViewCommittee } from '../../../../view-models';
import { CommitteeListServiceModule } from '../committee-list-service.module';

@Injectable({
    providedIn: CommitteeListServiceModule
})
export class CommitteeSortService extends BaseSortListService<ViewCommittee> {
    protected storageKey = `CommitteeList`;

    private readonly staticSortOptions: OsSortingOption<ViewCommittee>[] = [
        { property: `name`, label: _(`Title`) },
        { property: `meetingAmount`, label: _(`Amount of meetings`) },
        { property: `memberAmount`, label: _(`Amount of accounts`) }
    ];

    public constructor(translate: TranslateService, store: StorageService) {
        super(translate, store, {
            sortProperty: `name`,
            sortAscending: true
        });
    }

    protected getSortOptions(): OsSortingOption<ViewCommittee>[] {
        return this.staticSortOptions;
    }
}
