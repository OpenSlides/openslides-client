import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { BaseViaBackendImportListComponent } from 'src/app/site/base/base-via-backend-import-list.component';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { accountColumns, accountHeadersAndVerboseNames } from '../../definitions';
import { AccountImportService } from '../../services/account-import.service/account-import.service';

@Component({
    selector: `os-account-import-list`,
    templateUrl: `./account-import-list.component.html`,
    styleUrls: [`./account-import-list.component.scss`]
})
export class AccountImportListComponent extends BaseViaBackendImportListComponent {
    public possibleFields = accountColumns;

    public columns: ImportListHeaderDefinition[] = this.possibleFields.map(header => ({
        property: header,
        label: (<any>accountHeadersAndVerboseNames)[header],
        isTableColumn: true,
        customInfo: header === `gender` ? this.getTranslatedGenderInfoObservable() : undefined
    }));

    public constructor(
        protected override translate: TranslateService,
        public override importer: AccountImportService,
        public orgaSettings: OrganizationSettingsService
    ) {
        super(importer);
    }

    private getTranslatedGenderInfoObservable(): Observable<string> {
        return this.translate
            .get(`Possible options`)
            .pipe(map(framework => framework + `: ` + this.orgaSettings.instant(`genders`).join(`, `)));
    }
}
