import { Injectable } from '@angular/core';
import { PollListServiceModule } from '../poll-list-service.module';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ViewPoll } from '../../../../view-models';
import { TranslateService } from '@ngx-translate/core';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';
import { BaseMeetingFilterListService } from 'src/app/site/pages/meetings/base/base-meeting-filter-list.service';
import { StorageService } from 'src/app/gateways/storage.service';

@Injectable({
    providedIn: PollListServiceModule
})
export class PollListFilterService extends BaseMeetingFilterListService<ViewPoll> {
    /**
     * set the storage key name
     */
    // protected storageKey = `PollList`;

    public constructor(
        baseFilterListService: BaseFilterListService<ViewPoll>,
        history: HistoryService,
        store: StorageService,
        private translate: TranslateService
    ) {
        super(baseFilterListService, store, history, `PollList`);
    }

    /**
     * Filter out analog polls
     * @param viewPoll All polls
     */
    protected override preFilter(viewPoll: ViewPoll[]): ViewPoll[] | void {
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
