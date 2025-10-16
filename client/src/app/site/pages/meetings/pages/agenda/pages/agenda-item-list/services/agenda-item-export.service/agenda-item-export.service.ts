import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MeetingCsvExportForBackendService } from 'src/app/site/pages/meetings/services/export/meeting-csv-export-for-backend.service';

import { AgendaPdfCatalogExportService } from '../../../../services/agenda-pdf-catalog-export.service/agenda-pdf-catalog-export.service';
import { AgendaItemListServiceModule } from '../agenda-item-list-service.module';

export enum ExportFileFormat {
    PDF = 0,
    CSV
}

export type InfoToExport =
    | `item_number`
    | `title`
    | `text`
    | `attachments`
    | `moderation_notes`
    | `list_of_speakers`
    | `polls`
    | `internal_commentary`;

export type pdfMetaInfo = `table_of_content` | `line_break` | `header` | `footer` | `current_date`;

export type csvMetaInfo = `duration` | `tags` | `agenda_visibility` | `done`;

@Injectable({
    providedIn: AgendaItemListServiceModule
})
export class AgendaItemExportService {
    public constructor(
        private translate: TranslateService,
        private csvExportService: MeetingCsvExportForBackendService,
        private pdfExportService: MeetingPdfExportService,
        private agendaPdfExportService: AgendaPdfCatalogExportService
    ) {}

    public exportAsCsv(source: ViewAgendaItem[], info: InfoToExport[], csvMeta: csvMetaInfo): void {
        const config = [];
        if (info.includes(`item_number`)) {
            config.push({ label: `item_number`, property: `item_number` });
        }
        if (info.includes(`title`)) {
            config.push({ label: `title`, map: (viewItem): string => viewItem.content_object?.title });
        }
        if (info.includes(`text`)) {
            config.push({
                label: `text`,
                map: (viewItem): string =>
                    viewItem.content_object?.getCSVExportText ? viewItem.content_object.getCSVExportText() : ``
            });
        }
        if (info.includes(`moderation_notes`)) {
            config.push({
                label: `moderation_notes`,
                map: (viewItem): string => viewItem.content_object?.list_of_speakers?.moderator_notes ?? ``
            });
        }
        if (info.includes(`list_of_speakers`)) {
            config.push({
                label: `list_of_speakers`,
                map: (viewItem): string => {
                    if (
                        viewItem.content_object?.list_of_speakers &&
                        viewItem.content_object.list_of_speakers.waitingSpeakerAmount > 0
                    ) {
                        return viewItem.content_object?.list_of_speakers.waitingSpeakerAmount.toString();
                    }
                    return ``;
                }
            });
        }
        if (info.includes(`internal_commentary`)) {
            config.push({ label: `agenda_comment`, property: `comment` });
        }
        if (csvMeta.includes(`duration`)) {
            config.push({ label: `agenda_duration`, property: `duration` });
        }
        if (csvMeta.includes(`agenda_visibility`)) {
            config.push({ label: `agenda_type`, property: `verboseCsvType` });
        }
        if (csvMeta.includes(`tags`)) {
            config.push({
                label: `tags`,
                map: (viewItem): string => viewItem.tags?.map(tag => tag.getTitle()).join(`,`) ?? ``
            });
        }
        if (csvMeta.includes(`done`)) {
            config.push({ label: `agenda_closed`, property: `closed` });
        }

        this.csvExportService.export(source, config, this.translate.instant(`Agenda`) + `.csv`);
    }

    public exportAsPdf(source: ViewAgendaItem[], info: InfoToExport[], meta: pdfMetaInfo[]): void {
        const filename = this.translate.instant(`Agenda`);
        const metaExportInfo = { pdfOptions: [...meta] };
        this.pdfExportService.download({
            docDefinition: this.agendaPdfExportService.agendaListToDocDef(source, info, meta),
            exportInfo: metaExportInfo,
            filename
        });
    }
}
