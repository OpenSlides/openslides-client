import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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

    public constructor(translate: TranslateService, store: StorageService) {
        super(translate, store, {
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
