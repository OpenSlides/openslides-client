import { inject, Service } from '@angular/core';
import { PollState } from '@app/domain/models/poll/poll-constants';
import { BaseFilterListService, OsFilter } from '@app/site/base/base-filter.service';
import { ActiveFiltersService } from '@app/site/services/active-filters.service';
import { _, TranslateService } from '@ngx-translate/core';

import { ViewPoll } from '../../view-models';

@Service()
export class PollListFilterService extends BaseFilterListService<ViewPoll> {
    /**
     * set the storage key name
     */
    protected storageKey = `PollList`;

    private translate = inject(TranslateService);

    public constructor() {
        const store = inject(ActiveFiltersService);
        super(store);
    }

    /**
     * Filter out analog polls
     * @param viewPoll All polls
     */
    protected override preFilter(viewPoll: ViewPoll[]): ViewPoll[] {
        return viewPoll.filter(poll => !poll.isAnalog);
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewPoll>[] {
        return [
            {
                property: `published`,
                label: _(`Is published`),
                options: [
                    { label: _(`Is published`), condition: true },
                    { label: _(`Is not published`), condition: [false, null] }
                ]
            },
            {
                property: `state`,
                label: this.translate.instant(`State`),
                options: [
                    { condition: PollState.Created, label: this.translate.instant(`created`) },
                    { condition: PollState.Started, label: this.translate.instant(`started`) },
                    { condition: PollState.Finished, label: this.translate.instant(`finished`) }
                ]
            }
        ];
    }
}
