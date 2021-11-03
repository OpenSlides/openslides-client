import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Motion } from 'app/shared/models/motions/motion';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';
import { MotionImportService } from 'app/site/motions/services/motion-import.service';

import { ImportListViewHeaderDefinition } from '../../../../shared/components/import-list-view/import-list-view.component';
import { getVerboseNameOfMotionProperty, motionExpectedHeaders } from '../../motions.constants';

/**
 * Component for the motion import list view.
 */
@Component({
    selector: `os-motion-import-list`,
    templateUrl: `./motion-import-list.component.html`,
    styleUrls: [`./motion-import-list.component.scss`]
})
export class MotionImportListComponent extends BaseImportListComponent<Motion> {
    public possibleFields = motionExpectedHeaders.map(header => getVerboseNameOfMotionProperty(header));

    public get columns(): ImportListViewHeaderDefinition[] {
        return motionExpectedHeaders.map(header => ({
            prop: `newEntry.${header}`,
            label: this.translate.instant(getVerboseNameOfMotionProperty(header)),
            isTableColumn: true,
            isRequired: header === `title` || header === `text`
        }));
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public importer: MotionImportService
    ) {
        super(componentServiceCollector, translate, importer);
        this.load();
    }

    private load(): void {
        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `motion_ids`
                },
                {
                    idField: `user_ids`,
                    fieldset: `shortName`
                },
                {
                    idField: `motion_category_ids`
                },
                {
                    idField: `motion_block_ids`,
                    fieldset: `title`
                },
                {
                    idField: `tag_ids`
                }
            ]
        });
    }

    public getVerboseName(property: string): string {
        return getVerboseNameOfMotionProperty(property);
    }
}
