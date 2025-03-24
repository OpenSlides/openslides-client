import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseViaBackendImportListMeetingComponent } from 'src/app/site/base/base-via-backend-import-list-meeting.component';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { participantColumns, participantHeadersAndVerboseNames } from '../../definitions';
import { ParticipantImportService } from '../../services';

@Component({
    selector: `os-participant-import-list`,
    templateUrl: `./participant-import-list.component.html`,
    styleUrls: [`./participant-import-list.component.scss`],
    standalone: false
})
export class ParticipantImportListComponent extends BaseViaBackendImportListMeetingComponent {
    public possibleFields = participantColumns;

    public columns: ImportListHeaderDefinition[] = this.possibleFields.map(header => ({
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
        super(importer);
    }
}
