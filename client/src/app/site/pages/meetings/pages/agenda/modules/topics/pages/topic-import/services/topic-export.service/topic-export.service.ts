import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CsvExportService } from 'src/app/gateways/export/csv-export.service';

import { topicHeadersAndVerboseNames } from '../../../../definitions';
import { TopicImportServiceModule } from '../topic-import-service.module';

interface TopicExport {
    title?: string;
    text?: string;
    agenda_duration?: string;
    agenda_comment?: string;
    agenda_type?: string;
}

@Injectable({
    providedIn: TopicImportServiceModule
})
export class TopicExportService {
    constructor(private csvExportService: CsvExportService, private translate: TranslateService) {}

    public downloadCsvImportExample(): void {
        const rows: TopicExport[] = [
            { title: `Demo 1`, text: `Demo text 1`, agenda_duration: `60`, agenda_comment: `Test comment` },
            { title: `Break`, agenda_duration: `10`, agenda_type: `internal` },
            { title: `Demo 2`, text: `Demo text 2`, agenda_duration: `90`, agenda_type: `hidden` }
        ];

        this.csvExportService.dummyCSVExport<TopicExport>(
            topicHeadersAndVerboseNames,
            rows,
            `${this.translate.instant(`Agenda`)}-${this.translate.instant(`example`)}.csv`
        );
    }
}
