import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnsDefinition } from 'src/app/gateways/export/csv-export.service';
import { CsvExportForBackendService } from 'src/app/gateways/export/csv-export.service/csv-export-for-backend.service';

import { ViewCommittee } from '../../../../view-models/view-committee';
import { CommitteeListServiceModule } from '../committee-list-service.module';

@Injectable({
    providedIn: CommitteeListServiceModule
})
export class CommitteeExportService {
    public constructor(private translate: TranslateService, private csvExport: CsvExportForBackendService) {}

    public export(committees: ViewCommittee[]): void {
        const properties: CsvColumnsDefinition<ViewCommittee> = [
            {
                property: `name`
            },
            {
                property: `description`
            },
            {
                label: `organization_tags`,
                map: model => model.organization_tags.map(tag => tag.name).join(`,`)
            },
            {
                label: `forward_to_committees`,
                map: model => model.forward_to_committees.map(committee => committee.name).join(`,`)
            },
            {
                label: `managers`,
                map: model =>
                    model
                        .getManagers()
                        .map(manager => manager.username)
                        .join(`, `)
            }
        ];
        const filename = `${this.translate.instant(`Committees`)}.csv`;
        this.csvExport.export(committees, properties, filename);
    }
}
