import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { OsFilter } from 'src/app/site/base/base-filter.service';
import { BaseMeetingFilterListService } from 'src/app/site/pages/meetings/base/base-meeting-filter-list.service';
import { MeetingActiveFiltersService } from 'src/app/site/pages/meetings/services/meeting-active-filters.service';

import { ViewPoll } from '../../../../view-models';
import { PollListServiceModule } from '../poll-list-service.module';

@Injectable({
    providedIn: PollListServiceModule
})
export class PollListFilterService extends BaseMeetingFilterListService<ViewPoll> {
    /**
     * set the storage key name
     */
    protected storageKey = `PollList`;

    private translate = inject(TranslateService);

    public constructor(store: MeetingActiveFiltersService) {
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
                property: `state`,
                label: this.translate.instant(`State`),
                options: [
                    { condition: PollState.Created, label: this.translate.instant(`created`) },
                    { condition: PollState.Started, label: this.translate.instant(`started`) },
                    { condition: PollState.Finished, label: this.translate.instant(`finished (unpublished)`) },
                    { condition: PollState.Published, label: this.translate.instant(`published`) }
                ]
            },
            {
                property: `hasVoted`,
                label: this.translate.instant(`Votings`),
                options: [
                    { condition: false, label: this.translate.instant(`Voting is currently in progress.`) },
                    { condition: true, label: this.translate.instant(`You have already voted.`) }
                ]
            }
        ];
    }
}
