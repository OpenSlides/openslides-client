import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseViaBackendImportListComponent } from '@app/site/base/base-via-backend-import-list.component';
import { OrganizationSettingsService } from '@app/site/pages/organization/services/organization-settings.service';
import { ImportListHeaderDefinition } from '@app/ui/modules/import-list';
import { TranslateService } from '@ngx-translate/core';

import { accountColumns, accountHeadersAndVerboseNames } from '../../definitions';
import { AccountImportService } from '../../services/account-import.service/account-import.service';

@Component({
    selector: `os-account-import-list`,
    templateUrl: `./account-import-list.component.html`,
    styleUrls: [`./account-import-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AccountImportListComponent extends BaseViaBackendImportListComponent {
    public possibleFields = accountColumns;

    public columns: ImportListHeaderDefinition[] = this.possibleFields.map(header => ({
        property: header,
        label: (accountHeadersAndVerboseNames as any)[header],
        isTableColumn: true
    }));

    public constructor(
        protected override translate: TranslateService,
        public override importer: AccountImportService,
        public orgaSettings: OrganizationSettingsService
    ) {
        super(importer);
    }
}
