import { Injectable, Injector, ProviderToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MediafileRepositoryService } from 'src/app/gateways/repositories/mediafiles/mediafile-repository.service';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingOption } from 'src/app/site/base/base-sort.service';

import { ViewMediafile } from '../../../../view-models';
import { MediafileListServiceModule } from '../mediafile-list-service.module';

@Injectable({ providedIn: MediafileListServiceModule })
export class MediafileListSortService extends BaseSortListService<ViewMediafile> {
    /**
     * set the storage key name
     */
    protected storageKey = `MediafileList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = MediafileRepositoryService;

    private mediafilesSortOptions: OsSortingOption<ViewMediafile>[] = [
        { property: `title` },
        {
            property: `mimetype`,
            label: this.translate.instant(`Type`)
        },
        {
            property: `filesize`,
            label: this.translate.instant(`Size`)
        }
    ];

    public constructor(translate: TranslateService, store: StorageService, injector: Injector) {
        super(translate, store, injector, {
            sortProperty: `title`,
            sortAscending: true
        });
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewMediafile>[] {
        return this.mediafilesSortOptions;
    }
}
