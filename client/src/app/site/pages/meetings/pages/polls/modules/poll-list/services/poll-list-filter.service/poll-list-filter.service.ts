import { Injectable } from '@angular/core';
import { PollListServiceModule } from '../poll-list-service.module';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ViewPoll } from '../../../../view-models';
import { StorageService } from 'src/app/gateways/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: PollListServiceModule
})
export class PollListFilterService extends BaseFilterListService<ViewPoll> {
    /**
     * set the storage key name
     */
    protected storageKey = `PollList`;

    public constructor(store: StorageService, private translate: TranslateService) {
        super();
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
                label: _(`State`),
                options: [
                    { condition: PollState.Created, label: _(`created`) },
                    { condition: PollState.Started, label: _(`started`) },
                    { condition: PollState.Finished, label: _(`finished (unpublished)`) },
                    { condition: PollState.Published, label: _(`published`) }
                ]
            },
            {
                property: `hasVoted`,
                label: _(`Votings`),
                options: [
                    { condition: false, label: _(`Voting is currently in progress.`) },
                    { condition: true, label: _(`You have already voted.`) }
                ]
            }
        ];
    }
}
