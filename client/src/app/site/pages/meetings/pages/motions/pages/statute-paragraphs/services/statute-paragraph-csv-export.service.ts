import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { CsvColumnDefinitionProperty } from 'src/app/gateways/export/csv-export.service';
import { ViewMotionStatuteParagraph } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingCsvExportService } from 'src/app/site/pages/meetings/services/export';

import { StatuteParagraphExport, statuteParagraphHeadersAndVerboseNames } from '../definitions';
import { StatuteParagraphServiceModule } from './statute-paragraph-service.module';

@Injectable({
    providedIn: StatuteParagraphServiceModule
})
export class StatuteParagraphCsvExportService {
    public constructor(private csvExport: MeetingCsvExportService, private translate: TranslateService) {}

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
        this.csvExport.export(statutes, exportProperties, _(`Statute`) + `.csv`);
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
        const filename = `${_(`Statute`)}-${_(`example`)}.csv`;
        this.csvExport.dummyCSVExport(statuteParagraphHeadersAndVerboseNames, rows, filename);
    }
}
