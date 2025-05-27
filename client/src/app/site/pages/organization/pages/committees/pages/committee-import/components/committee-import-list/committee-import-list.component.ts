import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseViaBackendImportListComponent } from 'src/app/site/base/base-via-backend-import-list.component';
import { committeeHeadersAndVerboseNames } from 'src/app/site/pages/organization/pages/committees/pages/committee-import/definitions';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { CommitteeImportService } from '../../services/committee-import.service/committee-import.service';

@Component({
    selector: `os-committee-import-list`,
    templateUrl: `./committee-import-list.component.html`,
    styleUrls: [`./committee-import-list.component.scss`],
    standalone: false
})
export class CommitteeImportListComponent extends BaseViaBackendImportListComponent {
    public possibleFields = Object.keys(committeeHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(committeeHeadersAndVerboseNames).map(header => ({
        property: header,
        label: (committeeHeadersAndVerboseNames as any)[header],
        isTableColumn: true,
        type: [`meeting_start_time`, `meeting_end_time`].includes(header) ? `date` : `string`,
        is_object: [
            `name`,
            `forward_to_committees`,
            `organization_tags`,
            `managers`,
            `meeting_admins`,
            `meeting_template`,
            `parent`
        ].includes(header),
        is_list: [`forward_to_committees`, `organization_tags`, `managers`, `meeting_admins`].includes(header)
    }));

    public constructor(
        protected override translate: TranslateService,
        public override importer: CommitteeImportService
    ) {
        super(importer);
    }
}
