import { Component } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Motion } from 'app/shared/models/motions/motion';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';
import { MotionCsvExportService } from 'app/site/motions/services/motion-csv-export.service';
import { MotionImportService } from 'app/site/motions/services/motion-import.service';
import { getMotionExportHeadersAndVerboseNames, getVerboseNameOfMotionProperty } from '../../motions.constants';

/**
 * Component for the motion import list view.
 */
@Component({
    selector: 'os-motion-import-list',
    templateUrl: './motion-import-list.component.html',
    styleUrls: ['./motion-import-list.component.scss']
})
export class MotionImportListComponent extends BaseImportListComponent<Motion> {
    /**
     * Fetach a list of the headers expected by the importer, and prepare them
     * to be translateable (upper case)
     *
     * @returns a list of strings matching the expected headers
     */
    public get expectedHeader(): string[] {
        return Object.values<string>(getMotionExportHeadersAndVerboseNames()).map(item => this.translate.instant(item));
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        importer: MotionImportService,
        private motionCSVExport: MotionCsvExportService
    ) {
        super(componentServiceCollector, importer);
        this.load();
    }

    private load(): void {
        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [1], // TODO
            follow: [
                {
                    idField: 'motion_ids'
                },
                {
                    idField: 'user_ids',
                    fieldset: 'shortName'
                },
                {
                    idField: 'motion_category_ids'
                },
                {
                    idField: 'motion_block_ids',
                    fieldset: 'title'
                },
                {
                    idField: 'tag_ids'
                }
            ]
        });
    }

    /**
     * Triggers an example csv download
     */
    public downloadCsvExample(): void {
        this.motionCSVExport.exportDummyMotion();
    }

    public getVerboseName(property: string): string {
        return getVerboseNameOfMotionProperty(property);
    }
}
