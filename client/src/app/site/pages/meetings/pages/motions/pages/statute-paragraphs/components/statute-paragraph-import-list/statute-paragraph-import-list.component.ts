import { Component } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { BaseImportListComponent } from 'src/app/site/base/base-import-list.component';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { statuteParagraphHeadersAndVerboseNames } from '../../definitions';
import { StatuteParagraphImportService } from '../../services/statute-paragraph-import.service';

@Component({
    selector: `os-statute-paragraph-import-list`,
    templateUrl: `./statute-paragraph-import-list.component.html`,
    styleUrls: [`./statute-paragraph-import-list.component.scss`]
})
export class StatuteParagraphImportListComponent extends BaseImportListComponent<MotionStatuteParagraph> {
    public possibleFields = Object.values(statuteParagraphHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(statuteParagraphHeadersAndVerboseNames).map(header => ({
        property: `newEntry.${header}`,
        label: _(statuteParagraphHeadersAndVerboseNames[header]),
        isTableColumn: true,
        isRequired: true
    }));

    public constructor(
        protected override translate: TranslateService,
        public override importer: StatuteParagraphImportService
    ) {
        super(importer);
    }
}
