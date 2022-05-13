import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingDefinition, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewCommittee } from '../../../../view-models';
import { CommitteeListServiceModule } from '../committee-list-service.module';

@Injectable({
    providedIn: CommitteeListServiceModule
})
export class CommitteeSortService extends BaseSortListService<ViewCommittee> {
    protected storageKey = `CommitteeList`;

    private readonly staticSortOptions: OsSortingOption<ViewCommittee>[] = [
        { property: `name`, label: this.translate.instant(`Title`) },
        { property: `meetingAmount`, label: this.translate.instant(`Amount of meetings`) },
        { property: `memberAmount`, label: this.translate.instant(`Amount of accounts`) }
    ];

    public constructor(translate: TranslateService, store: StorageService) {
        super(translate, store);
    }

    protected getSortOptions(): OsSortingOption<ViewCommittee>[] {
        return this.staticSortOptions;
    }

    protected getDefaultDefinition(): OsSortingDefinition<ViewCommittee> {
        return {
            sortProperty: `name`,
            sortAscending: true
        };
    }
}
