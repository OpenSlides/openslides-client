import { Injectable } from '@angular/core';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

import { GroupControllerService } from '../../../pages/participants';
import { StructureLevelControllerService } from '../../../pages/participants/pages/structure-levels/services/structure-level-controller.service';
import { ViewBallot } from '../../../pages/polls';
import { PollServiceModule } from '../services/poll-service.module';

@Injectable({
    providedIn: PollServiceModule
})
export class VotesFilterService extends BaseFilterListService<any> {
    protected storageKey = `VotesEntry`;

    private groupFilterOptions: OsFilter<ViewBallot> = {
        property: `groupIds`,
        label: `Groups`,
        options: []
    };

    private structureLevelFilterOptions: OsFilter<ViewBallot> = {
        property: `structureLevelIds`,
        label: `Structure level`,
        options: []
    };

    public constructor(
        store: ActiveFiltersService,
        groupRepo: GroupControllerService,
        structureRepo: StructureLevelControllerService
    ) {
        super(store);

        this.updateFilterForRepo({
            repo: groupRepo,
            filter: this.groupFilterOptions
        });
        this.updateFilterForRepo({
            repo: structureRepo,
            filter: this.structureLevelFilterOptions
        });
    }

    protected getFilterDefinitions(): OsFilter<any>[] {
        return [].concat(this.groupFilterOptions, this.structureLevelFilterOptions);
    }
}
