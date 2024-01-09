import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseViaBackendImportListComponent } from 'src/app/site/base/base-via-backend-import-list.component';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { participantHeadersAndVerboseNames } from '../../definitions';
import { ParticipantImportService } from '../../services';

@Component({
    selector: `os-participant-import-list`,
    templateUrl: `./participant-import-list.component.html`,
    styleUrls: [`./participant-import-list.component.scss`]
})
export class ParticipantImportListComponent extends BaseViaBackendImportListComponent {
    public possibleFields = Object.keys(participantHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(participantHeadersAndVerboseNames).map(header => ({
        property: header,
        label: (<any>participantHeadersAndVerboseNames)[header],
        isTableColumn: true
    }));

    /**
     * Constructor for list view bases
     */
    public constructor(
        protected override translate: TranslateService,
        public override readonly importer: ParticipantImportService
    ) {
        super();
    }
}
