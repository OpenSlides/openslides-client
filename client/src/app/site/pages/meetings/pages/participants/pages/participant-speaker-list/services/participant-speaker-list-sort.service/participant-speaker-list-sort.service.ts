import { Injectable, ProviderToken } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { SpeakerRepositoryService } from 'src/app/gateways/repositories/speakers/speaker-repository.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';

import { ViewSpeaker } from '../../../../../agenda';

@Injectable({
    providedIn: `root`
})
export class ParticipantSpeakerListSortService extends BaseSortListService<ViewSpeaker> {
    /**
     * set the storage key name
     */
    protected storageKey = `SpeakerList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = SpeakerRepositoryService;

    /**
     * Define the sort options
     */
    private speakerSortOptions: OsSortingOption<ViewSpeaker>[] = [
        { property: `id`, label: _(`Receipt of contributions`) },
        { property: `begin_time`, label: _(`Speech start time`) },
        { property: `name`, label: _(`Speaker`) },
        {
            property: `numbering`,
            label: _(`Numbering`),
            foreignBaseKeys: { agenda_item: [`item_number`], motion: [`number`] }
        }
    ];

    public constructor() {
        super({
            sortProperty: `begin_time`,
            sortAscending: true
        });
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewSpeaker>[] {
        return this.speakerSortOptions;
    }
}
