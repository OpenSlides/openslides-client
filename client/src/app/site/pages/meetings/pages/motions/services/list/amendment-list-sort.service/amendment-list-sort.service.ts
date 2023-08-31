import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { MotionListSortService } from '../motion-list-sort.service';
import { MotionsListServiceModule } from '../motions-list-service.module';

@Injectable({
    providedIn: MotionsListServiceModule
})
export class AmendmentListSortService extends MotionListSortService {
    /**
     * set the storage key name
     */
    protected override storageKey = `AmendmentList`;

    private amendmentSortOptions: OsSortingOption<ViewMotion>[] = [
        {
            property: `parentAndLineNumber`,
            label: this.translate.instant(`Main motion and line number`),
            baseKeys: [`amendment_paragraphs`],
            foreignBaseKeys: {
                motion: [`number`, `text`],
                motion_change_recommendation: [`rejected`],
                meeting: [`motions_line_length`]
            }
        }
    ];

    constructor(
        translate: TranslateService,
        store: StorageService,
        meetingSettingsService: MeetingSettingsService,
        injector: Injector
    ) {
        super(translate, store, meetingSettingsService, injector, {
            sortProperty: `title`,
            sortAscending: true
        });
    }

    protected override getSortOptions(): OsSortingOption<ViewMotion>[] {
        return this.amendmentSortOptions.concat(super.getSortOptions());
    }
}
