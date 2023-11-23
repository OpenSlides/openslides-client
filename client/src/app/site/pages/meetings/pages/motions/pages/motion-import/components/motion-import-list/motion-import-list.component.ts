import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseViaBackendImportListComponent } from 'src/app/site/base/base-via-backend-import-list.component';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { motionImportFields } from '../../../../services/export/definitions';
import { MotionImportService } from '../../services/motion-import.service';

@Component({
    selector: `os-motion-import-list`,
    templateUrl: `./motion-import-list.component.html`,
    styleUrls: [`./motion-import-list.component.scss`]
})
export class MotionImportListComponent extends BaseViaBackendImportListComponent {
    public possibleFields = Object.keys(motionImportFields);

    public get columns(): ImportListHeaderDefinition[] {
        return Object.keys(motionImportFields).map(header => ({
            property: header,
            label: this.translate.instant(motionImportFields[header]),
            isTableColumn: true,
            isRequired: header === `title` || header === `text`
        }));
    }

    public constructor(protected override translate: TranslateService, public override importer: MotionImportService) {
        super(importer);
    }
}
