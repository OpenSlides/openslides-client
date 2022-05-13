import { Injectable } from '@angular/core';
import { MediafileListServiceModule } from '../mediafile-list-service.module';
import { BaseSortListService, OsSortingOption, OsSortingDefinition } from 'src/app/site/base/base-sort.service';
import { ViewMediafile } from '../../../../view-models';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';

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
        super(translate, store);
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewMediafile>[] {
        return this.mediafilesSortOptions;
    }

    /**
     * Required by parent
     *
     * @returns the default sorting strategy
     */
    public async getDefaultDefinition(): Promise<OsSortingDefinition<ViewMediafile>> {
        return {
            sortProperty: `title`,
            sortAscending: true
        };
    }
}
