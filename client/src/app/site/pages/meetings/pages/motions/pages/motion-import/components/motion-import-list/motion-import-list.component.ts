import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseImportListComponent } from 'src/app/site/base/base-import-list.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { getVerboseNameOfMotionProperty, motionExpectedHeaders } from '../../../../services/export/definitions';
import { MotionImportService } from '../../services/motion-import.service';

@Component({
    selector: `os-motion-import-list`,
    templateUrl: `./motion-import-list.component.html`,
    styleUrls: [`./motion-import-list.component.scss`]
})
export class MotionImportListComponent extends BaseImportListComponent<ViewMotion> {
    public possibleFields = motionExpectedHeaders.map(header => getVerboseNameOfMotionProperty(header));

    public get columns(): ImportListHeaderDefinition[] {
        return motionExpectedHeaders.map(header => ({
            property: `newEntry.${header}`,
            label: this.translate.instant(getVerboseNameOfMotionProperty(header)),
            isTableColumn: true,
            isRequired: header === `title` || header === `text`
        }));
    }

    protected override translate = inject(TranslateService);
    public override importer = inject(MotionImportService);

    public getVerboseName(property: keyof ViewMotion): string {
        return getVerboseNameOfMotionProperty(property);
    }
}
