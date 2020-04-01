import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { ViewAgendaItem } from '../models/view-agenda-item';

/**
 * Exports CSVs for Agendas. Collect all CSV types here to have them in one place.
 */
@Injectable({
    providedIn: 'root'
})
export class AgendaCsvExportService {
    /**
     * Does nothing.
     *
     * @param csvExport CsvExportService
     * @param translate TranslateService
     */
    public constructor(private csvExport: CsvExportService, private translate: TranslateService) {}

    /**
     * Export all Agendas as CSV
     *
     * @param Agendas Agendas to export
     */
    public exportItemList(items: ViewAgendaItem[]): void {
        this.csvExport.export(
            items,
            [
                { label: 'Title', map: viewItem => viewItem.getTitle() },
                {
                    label: 'Text',
                    map: viewItem => (viewItem.contentObject ? viewItem.contentObject.getCSVExportText() : '')
                },
                { label: 'Duration', property: 'duration' },
                { label: 'Comment', property: 'comment' },
                { label: 'Item type', property: 'verboseCsvType' },
                { label: 'Tags', property: 'tags' }
            ],
            this.translate.instant('Agenda') + '.csv'
        );
    }
}
