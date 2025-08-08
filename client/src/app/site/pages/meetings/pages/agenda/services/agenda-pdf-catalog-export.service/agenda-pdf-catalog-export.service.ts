import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content } from 'pdfmake/interfaces';
import { PdfError } from 'src/app/gateways/export/pdf-document.service';

import { MeetingPdfExportService } from '../../../../services/export';
import { ViewAgendaItem } from '../../view-models';
import { AgendaItemCommonServiceModule } from '../agenda-item-common-service.module';

const AGENDA_PDF_OPTIONS = {
    Toc: `table_of_content`,
    AddBreaks: `line_breaks`,
    Header: `header`,
    Footer: `footer`
};

@Injectable({
    providedIn: AgendaItemCommonServiceModule
})
export class AgendaPdfCatalogExportService {
    public constructor(
        private translate: TranslateService,
        private pdfService: MeetingPdfExportService
    ) {}

    /**
     * Converts the list of agenda items to pdfmake doc definition.
     * Public entry point to conversion of multiple agenda items.
     *
     * @param agendaItems the list of view agendaItem to convert
     * @param info
     * @param pdfMeta
     * @returns pdfmake doc definition as object
     */
    public agendaListToDocDef(agendaItems: ViewAgendaItem[], exportInfo: any, pdfMeta: string[]): Content {
        let doc = [];
        const agendaDocList = [];
        const printToc = pdfMeta?.includes(AGENDA_PDF_OPTIONS.Toc);
        const enforcePageBreaks = pdfMeta?.includes(AGENDA_PDF_OPTIONS.AddBreaks);

        for (let agendaItemIndex = 0; agendaItemIndex < agendaItems.length; ++agendaItemIndex) {
            try {
                const agendaDocDef: any[] = this.agendaItemToDoc(agendaItems[agendaItemIndex], exportInfo, pdfMeta);

                // add id field to the first page of a motion to make it findable over TOC
                agendaDocDef[0].id = `${agendaItems[agendaItemIndex].id}`;

                agendaDocList.push(agendaDocDef);

                if (agendaItemIndex < agendaItems.length - 1 && enforcePageBreaks) {
                    agendaDocList.push(this.pdfService.getPageBreak());
                } else if (agendaItemIndex < agendaItems.length - 1 && !enforcePageBreaks) {
                    agendaDocList.push(this.pdfService.getSpacer());
                }
            } catch (err) {
                const errorText = `${this.translate.instant(`Error during PDF creation of agenda item:`)} ${
                    agendaItems[agendaItemIndex].item_number
                }`;
                console.error(`${errorText}\nDebugInfo:\n`, err);
                throw new PdfError(errorText);
            }
        }

        if (agendaItems.length > 1 && printToc) {
            // doc.push(this.createToc(agendaItems));
            console.log(`XXX create Toc`);
        }

        doc = doc.concat(agendaDocList);

        return doc;
    }

    private agendaItemToDoc(agendaItem: ViewAgendaItem, info: any, _meta: any): Content[] {
        const agendaItemDoc = [];
        if (info.includes(`title`) || info.includes(`item_number`)) {
            agendaItemDoc.push(...this.createNumberTitleDoc(agendaItem, info));
        }
        if (info.includes(`text`)) {
            agendaItemDoc.push(...this.createTextDoc(agendaItem));
        }
        if (info.includes(`attachments`)) {
            agendaItemDoc.push(...this.createAttachmentsDoc(agendaItem));
        }
        if (info.includes(`moderation_notes`)) {
            agendaItemDoc.push(...this.createModerationNotesDoc(agendaItem));
        }
        if (info.includes(`list_of_speakers`)) {
            agendaItemDoc.push(...this.createListOfSpeakersDoc(agendaItem));
        }
        if (info.includes(`polls`)) {
            agendaItemDoc.push(...this.createPollsDoc(agendaItem));
        }
        if (info.includes(`internal_commentary`)) {
            agendaItemDoc.push(...this.createCommentDoc(agendaItem));
        }
        return agendaItemDoc;
    }

    private createNumberTitleDoc(agendaItem: ViewAgendaItem, info: any): Content[] {
        const level = agendaItem.level ?? 0;
        const entry = {
            style: level ? `listChild` : `listParent`,
            columns: [
                {
                    width: level * 15,
                    text: ``
                },
                {
                    width: 60,
                    text: info.includes(`item_number`) ? agendaItem.item_number || `` : ``
                },
                {
                    text: info.includes(`title`) ? agendaItem.content_object!.getTitle() : ``
                }
            ]
        };
        return [entry];
    }

    private createTextDoc(agendaItem: ViewAgendaItem): Content[] {
        const entry = {
            text: agendaItem.content_object?.getCSVExportText ? agendaItem.content_object.getCSVExportText() : ``
        };
        return [entry];
    }

    private createAttachmentsDoc(agendaItem: ViewAgendaItem): Content[] {
        // TODO add complete url as link
        const attachments = agendaItem.content_object?.attachment_meeting_mediafiles ?? [];
        const entries = attachments.map(a => {
            return { text: `${a.url}` };
        });
        if (entries.length) {
            return [{ text: `Attachments` }, ...entries];
        }
        return [];
    }

    private createModerationNotesDoc(agendaItem: ViewAgendaItem): Content[] {
        // TODO use document html to pdf here
        const entry = { text: agendaItem.content_object?.list_of_speakers?.moderator_notes ?? `` };
        if (entry.text) {
            return [{ text: `Moderation Notes` }, entry];
        } else {
            return [];
        }
    }

    private createListOfSpeakersDoc(_agendaItem: ViewAgendaItem): Content[] {
        // TODO add los component
        return [{ text: `List of Speakers` }];
    }

    private createPollsDoc(_agendaItem: ViewAgendaItem): Content[] {
        // TODO add polls part of AgendaItemExport
        return [{ text: `Polls` }];
    }

    private createCommentDoc(agendaItem: ViewAgendaItem): Content[] {
        return [{ text: agendaItem.comment ?? `` }];
    }
}
