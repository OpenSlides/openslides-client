import { Component } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';
import { StatuteImportService } from 'app/site/motions/services/statute-import.service';
import { ImportListViewHeaderDefinition } from '../../../../../../shared/components/import-list-view/import-list-view.component';

const statuteParagraphHeadersAndVerboseNames = {
    title: 'Title',
    text: 'Text'
};

/**
 * Component for the statute paragraphs import list view.
 */
@Component({
    selector: 'os-statute-paragraph-import-list',
    templateUrl: './statute-paragraph-import-list.component.html'
})
export class StatuteParagraphImportListComponent extends BaseImportListComponent<MotionStatuteParagraph> {
    public possibleFields = Object.values(statuteParagraphHeadersAndVerboseNames);

    public columns: ImportListViewHeaderDefinition[] = Object.keys(statuteParagraphHeadersAndVerboseNames).map(
        header => ({
            prop: `newEntry.${header}`,
            label: this.translate.instant(statuteParagraphHeadersAndVerboseNames[header]),
            isTableColumn: true,
            isRequired: true
        })
    );

    /**
     * Constructor for list view bases
     *
     * @param titleService the title serivce
     * @param matSnackBar snackbar for displaying errors
     * @param translate the translate service
     * @param importer: The statute csv import service
     * @param statuteCSVExport: service for exporting example data
     */
    public constructor(componentServiceCollector: ComponentServiceCollector, public importer: StatuteImportService) {
        super(componentServiceCollector, importer);
    }
}
