import { Component } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { StatuteParagraph } from 'app/shared/models/motions/statute-paragraph';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';
import { StatuteCsvExportService } from 'app/site/motions/services/statute-csv-export.service';
import { StatuteImportService } from 'app/site/motions/services/statute-import.service';

/**
 * Component for the statute paragraphs import list view.
 */
@Component({
    selector: 'os-statute-import-list',
    templateUrl: './statute-import-list.component.html'
})
export class StatuteImportListComponent extends BaseImportListComponent<StatuteParagraph> {
    /**
     * Constructor for list view bases
     *
     * @param titleService the title serivce
     * @param matSnackBar snackbar for displaying errors
     * @param translate the translate service
     * @param importer: The statute csv import service
     * @param statuteCSVExport: service for exporting example data
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        importer: StatuteImportService,
        private statuteCSVExport: StatuteCsvExportService
    ) {
        super(componentServiceCollector, importer);
    }

    /**
     * Triggers an example csv download
     */
    public downloadCsvExample(): void {
        this.statuteCSVExport.exportDummyCSV();
    }
}
