import { inject, Service } from '@angular/core';
import { ViewAgendaItem } from '@app/site/pages/meetings/pages/agenda';
import { MeetingPdfExportService } from '@app/site/pages/meetings/services/export';
import { MeetingCsvExportForBackendService } from '@app/site/pages/meetings/services/export/meeting-csv-export-for-backend.service';
import { MeetingXmlExportService } from '@app/site/pages/meetings/services/export/meeting-xml-export.service';
import { TranslateService } from '@ngx-translate/core';

import { AgendaPdfCatalogExportService } from '../../../../services/agenda-pdf-catalog-export.service/agenda-pdf-catalog-export.service';

export enum ExportFileFormat {
    PDF = 0,
    CSV = 1,
    XML = 2
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

export type xmlMetaInfo = `test_info`;

@Service()
export class AgendaItemExportService {
    private translate = inject(TranslateService);
    private csvExportService = inject(MeetingCsvExportForBackendService);
    private pdfExportService = inject(MeetingPdfExportService);
    private agendaPdfExportService = inject(AgendaPdfCatalogExportService);
    private xmlExportService = inject(MeetingXmlExportService);

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

    public exportAsXML(source: ViewAgendaItem[]): void {
        const filename = this.translate.instant(`Agenda`) + `.xml`;
        this.xmlExportService.export(source, filename);
    }
}
