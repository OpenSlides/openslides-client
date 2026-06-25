import { Injectable } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

import { ViewPoll } from '../../view-models';

@Injectable({
    providedIn: 'root'
})
export class PollListFilterService extends BaseFilterListService<ViewPoll> {
    /**
     * set the storage key name
     */
    protected storageKey = `PollList`;

    public constructor(
        store: ActiveFiltersService,
        private translate: TranslateService
    ) {
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
