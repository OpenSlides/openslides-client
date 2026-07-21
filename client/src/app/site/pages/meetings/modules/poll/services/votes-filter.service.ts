import { inject, Service } from '@angular/core';
import { BaseFilterListService, OsFilter } from '@app/site/base/base-filter.service';
import { ActiveFiltersService } from '@app/site/services/active-filters.service';

import { GroupControllerService } from '../../../pages/participants';
import { StructureLevelControllerService } from '../../../pages/participants/pages/structure-levels/services/structure-level-controller.service';
import { ViewVote } from '../../../pages/polls';

@Service()
export class VotesFilterService extends BaseFilterListService<any> {
    protected storageKey = `VotesEntry`;

    private groupFilterOptions: OsFilter<ViewVote> = {
        property: `groupIds`,
        label: `Groups`,
        options: []
    };

    private structureLevelFilterOptions: OsFilter<ViewVote> = {
        property: `structureLevelIds`,
        label: `Structure level`,
        options: []
    };

    public constructor() {
        const store = inject(ActiveFiltersService);
        const groupRepo = inject(GroupControllerService);
        const structureRepo = inject(StructureLevelControllerService);
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
