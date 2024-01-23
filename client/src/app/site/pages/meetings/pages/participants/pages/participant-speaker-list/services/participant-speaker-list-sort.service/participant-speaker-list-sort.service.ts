import { Injectable, Injector, ProviderToken } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { SpeakerRepositoryService } from 'src/app/gateways/repositories/speakers/speaker-repository.service';
import { StorageService } from 'src/app/gateways/storage.service';
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
        { property: `id`, label: _(`Added to list of speaker`) },
        { property: `end_time`, label: _(`Speak end time`) },
        { property: `name`, label: _(`Speaker name`) }
    ];

    public constructor(translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, {
            sortProperty: `id`,
            sortAscending: false
        });
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewSpeaker>[] {
        return this.speakerSortOptions;
    }
}
