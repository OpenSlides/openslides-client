import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { OsSortingDefinition, OsSortingOption } from 'app/core/ui-services/base-sort.service';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { MotionSortListService } from './motion-sort-list.service';
import { ViewMotion } from '../models/view-motion';

@Injectable({
    providedIn: 'root'
})
export class AmendmentSortListService extends MotionSortListService {
    /**
     * set the storage key name
     */
    protected storageKey = 'AmendmentList';

    private amendmentSortOptions: OsSortingOption<ViewMotion>[] = [
        {
            property: 'parentAndLineNumber',
            label: this.translate.instant('Main motion and line number')
        }
    ];

    public constructor(
        protected translate: TranslateService,
        store: StorageService,
        historyService: HistoryService,
        config: OrganisationSettingsService
    ) {
        super(translate, store, historyService, config);
    }

    protected getSortOptions(): OsSortingOption<ViewMotion>[] {
        return this.amendmentSortOptions.concat(super.getSortOptions());
    }

    protected async getDefaultDefinition(): Promise<OsSortingDefinition<ViewMotion>> {
        return {
            sortProperty: 'parentAndLineNumber',
            sortAscending: true
        };
    }
}
