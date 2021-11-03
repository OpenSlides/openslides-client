import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnDefinitionProperty, CsvExportService } from 'app/core/ui-services/csv-export.service';

import { ViewMotionStatuteParagraph } from '../models/view-motion-statute-paragraph';
import { statuteHeadersAndVerboseNames } from '../modules/statute-paragraph/statute-paragraph.constants';

interface StatuteParagraphExport {
    title?: string;
    text?: string;
}

/**
 * Exports CSVs for statute paragraphs.
 */
@Injectable({
    providedIn: `root`
})
export class StatuteCsvExportService {
    /**
     * Does nothing.
     *
     * @param csvExport CsvExportService
     * @param translate TranslateService
     */
    public constructor(private csvExport: CsvExportService, private translate: TranslateService) {}

    /**
     * Export all statute paragraphs as CSV
     *
     * @param statute statute PParagraphs to export
     */
    public exportStatutes(statutes: ViewMotionStatuteParagraph[]): void {
        const exportProperties: CsvColumnDefinitionProperty<ViewMotionStatuteParagraph>[] = [
            { property: `title` },
            { property: `text` }
        ];
        this.csvExport.export(statutes, exportProperties, this.translate.instant(`Statute`) + `.csv`);
    }

    /**
     * Exports a short example file
     */
    public exportDummyCSV(): void {
        const rows: StatuteParagraphExport[] = [
            { title: `§1`, text: `This is the first section` },
            { title: `§1, A 3`, text: `This is another important aspect` },
            { title: `§2`, text: `Yet another` }
        ];
        const filename = `${this.translate.instant(`Statute`)}-${this.translate.instant(`example`)}.csv`;
        this.csvExport.dummyCSVExport(statuteHeadersAndVerboseNames, rows, filename);
    }
}
