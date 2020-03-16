import { Component } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { Motion } from 'app/shared/models/motions/motion';
import { BaseImportListComponentDirective } from 'app/site/base/base-import-list';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';
import { MotionCsvExportService } from 'app/site/motions/services/motion-csv-export.service';
import { MotionImportService } from 'app/site/motions/services/motion-import.service';

/**
 * Component for the motion import list view.
 */
@Component({
    selector: 'os-motion-import-list',
    templateUrl: './motion-import-list.component.html'
})
export class MotionImportListComponent extends BaseImportListComponentDirective<Motion> {
    /**
     * Fetach a list of the headers expected by the importer, and prepare them
     * to be translateable (upper case)
     *
     * @returns a list of strings matching the expected headers
     */
    public get expectedHeader(): string[] {
        return this.importer.expectedHeader.map(header => {
            if (header === 'motion_block') {
                return 'Motion block';
            } else {
                return header.charAt(0).toUpperCase() + header.slice(1);
            }
        });
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        importer: MotionImportService,
        private motionCSVExport: MotionCsvExportService
    ) {
        super(componentServiceCollector, importer);
    }

    /**
     * Triggers an example csv download
     */
    public downloadCsvExample(): void {
        this.motionCSVExport.exportDummyMotion();
    }
}
